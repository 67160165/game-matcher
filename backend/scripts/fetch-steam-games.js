/**
 * fetch-steam-games.js
 * -----------------------------------------------------------------------
 * Builds backend/seed/games.json using REAL data pulled from:
 *   - SteamSpy API      (https://steamspy.com/api.php)
 *   - Steam Store API   (https://store.steampowered.com/api/appdetails)
 *
 * Usage:
 *   cd backend
 *   node scripts/fetch-steam-games.js --count 60
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'seed', 'games.json');
const BACKUP_FILE = path.join(__dirname, '..', 'seed', 'games.backup.json');

const args = process.argv.slice(2);
const countArg = args.indexOf('--count');
const TARGET_COUNT = countArg !== -1 ? parseInt(args[countArg + 1], 10) : 60;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------
// Tag / genre heuristic mapping (ฉบับแก้ไขบั๊กคำซ้อนและคัดเฉพาะแท็กหลัก)
// ---------------------------------------------------------------------
const GENRE_ENUM = ['RPG', 'FPS', 'Puzzle', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Horror', 'Adventure', 'Fighting', 'Sandbox'];

const GENRE_KEYWORDS = {
  RPG: ['rpg', 'role-playing', 'jrpg', 'action rpg', 'crpg'],
  FPS: ['fps', 'first-person shooter', 'shooter', 'third-person shooter', 'hero shooter', 'tactical shooter'],
  Puzzle: ['puzzle', 'logic'],
  Strategy: ['strategy', 'tower defense', 'moba', 'card game', 'turn-based strategy', 'real time tactics', 'rts', 'grand strategy'],
  Simulation: ['simulation', 'farming sim', 'life sim', 'city builder', 'management', 'building'],
  Sports: ['sports', 'football', 'basketball', 'soccer', 'golf', 'baseball', 'tennis'],
  Racing: ['racing', 'driving', 'automobile sim', 'combat racing'],
  Horror: ['horror', 'survival horror', 'psychological horror'],
  Adventure: ['adventure', 'action-adventure', 'exploration', 'metroidvania'],
  Fighting: ['fighting', "beat 'em up", 'brawler', '2d fighter', '3d fighter'],
  Sandbox: ['sandbox', 'open world', 'crafting', 'survival'],
};

const MOOD_KEYWORDS = {
  Relaxing: ['relaxing', 'cozy', 'chill', 'wholesome'],
  Competitive: ['competitive', 'pvp', 'esports', 'ranked'],
  StoryDriven: ['story rich', 'narrative', 'story-driven', 'choices matter', 'visual novel'],
  Casual: ['casual', 'family friendly'],
  Hardcore: ['difficult', 'souls-like', 'roguelike', 'roguelite', 'hardcore', 'punishing', 'permadeath'],
};

const GRAPHICS_KEYWORDS = {
  Pixel: ['pixel graphics', 'retro', '8-bit', '16-bit'],
  Anime: ['anime', 'jrpg', 'visual novel'],
  Realistic: ['realistic', 'photorealistic', 'military'],
  Cartoon: ['cartoony', 'colorful', 'cartoon', 'stylized', 'hand-drawn'],
};

// เช็คระดับรายการแท็กแบบตรงขอบเขตคำ (ป้องกัน 'esports' ไปตรงกับ 'sports' หรือ 'rts')
function tagsMatchAny(tags, keywords) {
  const normalizedTags = tags.map((t) => t.toLowerCase().trim());
  return keywords.some((kw) => {
    const target = kw.toLowerCase().trim();
    return normalizedTags.some((tag) => {
      if (tag === target) return true;
      const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s|-|/)${escaped}($|\\s|-|/)`, 'i');
      return regex.test(tag);
    });
  });
}

function mapGenres(steamGenres, topTags) {
  // ตัดแท็ก eSports ออกจากการเป็นแนวเกม เพื่อไม่ให้สับสนกับเกมกีฬา (Sports)
  const combined = [...steamGenres, ...topTags].filter(
    (t) => t.toLowerCase() !== 'esports'
  );
  const matched = GENRE_ENUM.filter((g) => tagsMatchAny(combined, GENRE_KEYWORDS[g]));
  return matched.length ? matched : ['Adventure'];
}

function mapMood(topTags) {
  const matched = Object.keys(MOOD_KEYWORDS).filter((m) =>
    tagsMatchAny(topTags, MOOD_KEYWORDS[m])
  );
  return matched.length ? matched : ['Casual'];
}

function mapGraphics(topTags) {
  for (const style of ['Pixel', 'Anime', 'Realistic', 'Cartoon']) {
    if (tagsMatchAny(topTags, GRAPHICS_KEYWORDS[style])) return style;
  }
  return 'Realistic';
}

function mapDifficulty(topTags) {
  if (tagsMatchAny(topTags, ['souls-like', 'difficult', 'punishing', 'hardcore'])) {
    return 'Hard';
  }
  if (tagsMatchAny(topTags, ['competitive', 'esports', 'tactical', 'roguelike'])) {
    return 'Medium';
  }
  if (tagsMatchAny(topTags, ['casual', 'easy', 'relaxing', 'cozy'])) {
    return 'Easy';
  }
  return 'Medium';
}

function mapMultiplayer(categories) {
  const names = categories.map((c) => c.description.toLowerCase());
  const modes = [];
  if (names.some((n) => n.includes('single-player'))) modes.push('Solo');
  if (names.some((n) => n.includes('co-op'))) modes.push('Coop');
  if (names.some((n) => n.includes('pvp') || n.includes('multi-player'))) modes.push('PvP');
  return modes.length ? modes : ['Solo'];
}

function mapSessionLength(genres) {
  const shortGenres = ['Puzzle', 'Sports', 'Racing', 'Fighting', 'FPS'];
  const longGenres = ['RPG', 'Strategy', 'Sandbox', 'Simulation', 'Adventure'];
  const lengths = [];
  if (genres.some((g) => shortGenres.includes(g))) lengths.push('Short');
  if (genres.some((g) => longGenres.includes(g))) lengths.push('Long');
  return lengths.length ? lengths : ['Short', 'Long'];
}

// ---------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------
async function fetchTopAppIds(limit) {
  const lists = ['top100in2weeks', 'top100forever'];
  const ids = new Set();

  for (const request of lists) {
    const res = await fetch(`https://steamspy.com/api.php?request=${request}`);
    if (!res.ok) continue;
    const data = await res.json();
    Object.values(data).forEach((entry) => ids.add(entry.appid));
    await sleep(1000);
  }

  return Array.from(ids).slice(0, limit);
}

async function fetchSteamSpyDetails(appid) {
  const res = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchStoreDetails(appid) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`);
  if (!res.ok) return null;
  const data = await res.json();
  const entry = data[appid];
  if (!entry || !entry.success) return null;
  return entry.data;
}

function buildGame(id, spy, store) {
  const allTags = spy && spy.tags ? Object.keys(spy.tags) : [];
  const topTags = allTags.slice(0, 8);
  const steamGenres = (store?.genres || []).map((g) => g.description);
  const genre = mapGenres(steamGenres, topTags);

  const year = store?.release_date?.date ? new Date(store.release_date.date).getFullYear() : null;
  const isFree = store !== null && store !== undefined
    ? Boolean(store.is_free)
    : (spy?.price === '0' || spy?.price === 0);

  let description = (store?.short_description || spy?.name || '').trim();
  if (description.length > 160) description = description.slice(0, 157) + '...';

  const appid = store?.steam_appid || spy?.appid || id;
  const image = store?.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
  const storeUrl = `https://store.steampowered.com/app/${appid}`;

  return {
    id,
    appid,
    name: store?.name || spy?.name,
    description,
    image,
    storeUrl,
    genre,
    mood: mapMood(topTags),
    multiplayer: mapMultiplayer(store?.categories || []),
    platform: ['PC'],
    sessionLength: mapSessionLength(genre),
    difficulty: mapDifficulty(topTags),
    graphics: mapGraphics(topTags),
    price: isFree ? 'Free' : 'Paid',
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
  };
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------
async function main() {
  console.log(`Fetching top app ids from SteamSpy (target: ${TARGET_COUNT} games)...`);
  const appIds = await fetchTopAppIds(TARGET_COUNT * 2);

  const games = [];
  let nextId = 1;

  for (const appid of appIds) {
    if (games.length >= TARGET_COUNT) break;

    process.stdout.write(`  [${games.length + 1}/${TARGET_COUNT}] appid ${appid}... `);
    try {
      const [spy, store] = await Promise.all([fetchSteamSpyDetails(appid), fetchStoreDetails(appid)]);

      if (store && store.type !== 'game') {
        console.log('skip (not a game — DLC/soundtrack/tool)');
        await sleep(1500);
        continue;
      }
      if (!spy && !store) {
        console.log('skip (no data)');
        await sleep(1500);
        continue;
      }

      const game = buildGame(nextId, spy, store);
      games.push(game);
      nextId += 1;
      console.log(`OK — ${game.name} [${game.genre.join(', ')}]`);
    } catch (err) {
      console.log(`error: ${err.message}`);
    }

    await sleep(1500);
  }

  if (!games.length) {
    console.error('No games were fetched. Check your internet connection and try again.');
    process.exit(1);
  }

  if (fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, BACKUP_FILE);
    console.log(`Backed up existing seed file to ${BACKUP_FILE}`);
  }

  fs.writeFileSync(SEED_FILE, JSON.stringify(games, null, 2));
  console.log(`\nDone! Wrote ${games.length} games to ${SEED_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});