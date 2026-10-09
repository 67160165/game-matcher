const express = require('express');
const fs = require('fs');
const path = require('path');
const store = require('../db/store');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const SEED_FILE = path.join(__dirname, '..', 'seed', 'games.json');

// ---------- 1. คลังคำสำคัญสำหรับจำแนกข้อมูลเกมจาก Steam ----------
const GENRE_ENUM = ['RPG', 'FPS', 'Puzzle', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Horror', 'Adventure', 'Fighting', 'Sandbox'];

const GENRE_KEYWORDS = {
  RPG: ['rpg', 'role-playing', 'jrpg', 'action rpg', 'crpg', 'mmorpg', 'dungeon crawler'],
  FPS: ['fps', 'first-person shooter', 'shooter', 'third-person shooter', 'hero shooter', 'tactical shooter', 'arena shooter', 'looter shooter'],
  Puzzle: ['puzzle', 'logic', 'puzzle-platformer', 'mystery', 'escape room'],
  Strategy: ['strategy', 'tower defense', 'moba', 'card game', 'turn-based strategy', 'real time tactics', 'rts', 'grand strategy', '4x', 'auto battler'],
  Simulation: ['simulation', 'farming sim', 'life sim', 'city builder', 'management', 'building', 'automobile sim', 'flight', 'space sim', 'tycoon'],
  Sports: ['sports', 'football', 'basketball', 'soccer', 'golf', 'baseball', 'tennis', 'skateboarding', 'snowboarding', 'wrestling', 'hockey', 'boxing', 'fishing', 'billiards'],
  Racing: ['racing', 'driving', 'automobile sim', 'combat racing', 'motocross', 'kart racing', 'drift'],
  Horror: ['horror', 'survival horror', 'psychological horror', 'dark', 'thriller'],
  Adventure: ['adventure', 'action-adventure', 'exploration', 'metroidvania', 'interactive fiction'],
  Fighting: ['fighting', "beat 'em up", 'brawler', '2d fighter', '3d fighter', 'martial arts'],
  Sandbox: ['sandbox', 'open world', 'crafting', 'survival', 'base building', 'voxel'],
};

const THEME_KEYWORDS = {
  Fantasy: ['fantasy', 'dark fantasy', 'magic', 'dragons', 'mythology', 'dungeon', 'elves', 'wizard', 'sorcery'],
  SciFi: ['sci-fi', 'science fiction', 'space', 'futuristic', 'aliens', 'mechs', 'robots', 'galactic', 'starship'],
  Zombie: ['zombies', 'zombie', 'post-apocalyptic', 'outbreak', 'infected', 'undead'],
  Cyberpunk: ['cyberpunk', 'dystopian', 'hacking', 'transhumanism', 'neon', 'cyborg'],
  Medieval: ['medieval', 'historical', 'swordplay', 'rome', 'vikings', 'knights', 'feudal', 'castle', 'kingdom'],
  Modern: ['modern', 'military', 'crime', 'tactical', 'war', 'urban', 'contemporary', 'police'],
};

const MOOD_KEYWORDS = {
  Relaxing: ['relaxing', 'cozy', 'chill', 'wholesome', 'atmospheric', 'peaceful', 'calm'],
  Competitive: ['competitive', 'pvp', 'esports', 'ranked', 'tournament', 'arena'],
  StoryDriven: ['story rich', 'narrative', 'story-driven', 'choices matter', 'visual novel', 'cinematic', 'lore-rich'],
  Casual: ['casual', 'family friendly', 'arcade', 'party game', 'funny', 'cute'],
  Hardcore: ['difficult', 'souls-like', 'roguelike', 'roguelite', 'hardcore', 'punishing', 'permadeath', 'brutal'],
};

const GRAPHICS_KEYWORDS = {
  Pixel: ['pixel graphics', 'pixel art', 'retro', '8-bit', '16-bit'],
  Anime: ['anime', 'jrpg', 'visual novel', 'manga', 'otaku'],
  Cartoon: ['cartoony', 'colorful', 'cartoon', 'stylized', 'hand-drawn', 'comic', 'cel-shaded', 'cute'],
  Realistic: ['realistic', 'photorealistic', 'cinematic', 'unreal engine', 'immersive'],
};

const SEARCH_MODIFIERS = {
  theme: {
    Fantasy: 'Fantasy',
    SciFi: 'Sci-Fi Space',
    Zombie: 'Zombie Post-Apocalyptic',
    Cyberpunk: 'Cyberpunk',
    Medieval: 'Medieval Historical',
    Modern: 'Modern Tactical',
  },
  graphics: {
    Pixel: 'Pixel Art 2D',
    Anime: 'Anime JRPG',
    Cartoon: 'Stylized Cartoon',
    Realistic: '',
  },
  mood: {
    Relaxing: 'Relaxing Cozy',
    Competitive: 'Competitive PvP',
    StoryDriven: 'Story Rich Narrative',
    Casual: 'Casual Fun',
    Hardcore: 'Difficult Hardcore Roguelike',
  },
  multiplayer: {
    Solo: 'Singleplayer',
    Coop: 'Co-op Cooperative',
    PvP: 'Multiplayer PvP',
  },
};

const FALLBACK_GENRE_TERMS = {
  Sports: ['EA SPORTS', 'NBA 2K', 'Football Manager', 'PGA TOUR', 'WWE 2K', 'Riders Republic', 'Tony Hawk', 'Skate'],
  Racing: ['Forza', 'Need for Speed', 'Assetto Corsa', 'F1', 'DiRT Rally', 'CarX', 'MotoGP', 'BeamNG'],
  FPS: ['Counter-Strike', 'Call of Duty', 'Battlefield', 'DOOM', 'Rainbow Six', 'Apex Legends', 'Overwatch', 'Left 4 Dead'],
  RPG: ['Baldur', 'Witcher', 'Final Fantasy', 'Persona', 'Elden Ring', 'Cyberpunk', 'Elder Scrolls', 'Monster Hunter'],
  Puzzle: ['Portal', 'Tetris', 'Baba Is You', 'The Witness', 'Escape Simulator', 'Unpacking', 'Dorfromantik', 'We Were Here'],
  Strategy: ['Civilization', 'Age of Empires', 'Total War', 'StarCraft', 'Hearts of Iron', 'Crusader Kings', 'XCOM', 'Dota 2'],
  Simulation: ['Stardew Valley', 'Cities: Skylines', 'Euro Truck Simulator', 'Planet Zoo', 'Farming Simulator', 'PowerWash Simulator', 'RimWorld'],
  Horror: ['Resident Evil', 'Silent Hill', 'Phasmophobia', 'Dead by Daylight', 'Outlast', 'Lethal Company', 'Sons of the Forest'],
  Adventure: ['Red Dead Redemption', 'God of War', 'Subnautica', 'Sea of Thieves', 'Stray', 'Hollow Knight', 'It Takes Two'],
  Fighting: ['Street Fighter', 'TEKKEN', 'Mortal Kombat', 'Guilty Gear', 'Brawlhalla', 'Dragon Ball FighterZ'],
  Sandbox: ['Terraria', "Garry's Mod", 'Rust', 'ARK: Survival', 'Palworld', 'Valheim', 'Factorio', "No Man's Sky"],
};

const FREE_GENRE_TERMS = {
  Sports: ['eFootball', 'Freestyle 2', '3on3 FreeStyle', 'Fishing Planet', 'Omega Strikers', 'Pool', 'Golf'],
  Racing: ['Trackmania', 'RaceRoom Racing', 'Asphalt Legends', 'KartRider', 'Torque Drift'],
  FPS: ['Counter-Strike 2', 'Apex Legends', 'Overwatch 2', 'THE FINALS', 'PUBG', 'Delta Force', 'Destiny 2', 'Team Fortress 2', 'Halo Infinite'],
  RPG: ['Path of Exile', 'Warframe', 'Lost Ark', 'Genshin Impact', 'Guild Wars 2', 'THRONE AND LIBERTY', 'Once Human', 'Albion Online'],
  Puzzle: ['Helltaker', 'We Were Here', 'Portal Stories: Mel', 'Gravitas', 'Perspective', 'ena'],
  Strategy: ['Dota 2', 'Yu-Gi-Oh! Master Duel', 'MARVEL SNAP', 'Crusader Kings II', 'StarCraft', 'Legion TD', 'Bloons TD Battles 2'],
  Simulation: ['The Sims 4', 'War Thunder', 'World of Warships', 'DCS World', 'Fishing Planet', 'Fallout Shelter', 'VRChat'],
  Horror: ['Cry of Fear', "Spooky's Jump Scare", 'Doki Doki Literature Club', 'Deceit', 'SCP: Secret Laboratory', 'No More Room in Hell', 'Poppy Playtime'],
  Adventure: ['Sky: Children of the Light', 'HoloCure', 'Palia', 'Spiral Knights', 'Realm of the Mad God', 'Unturned'],
  Fighting: ['Brawlhalla', 'Idol Showdown', 'Killer Instinct', 'Dead or Alive 6', 'Granblue Fantasy Versus: Rising Free'],
  Sandbox: ['Unturned', 'Once Human', 'Creativerse', 'Trove', 'Muck', 'Palia', 'Rec Room'],
};

// ---------- 2. ฟังก์ชันแปลงข้อมูลเกมจาก Steam (รวมราคาไทยและปีวางขาย) ----------
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function textMatchesKeywords(tags, fullText, keywords) {
  const normalizedTags = tags.map((t) => t.toLowerCase().trim());
  const lowerText = fullText.toLowerCase();

  return keywords.some((kw) => {
    const target = kw.toLowerCase().trim();
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|-|/|\\(|\\)|,|\\.)${escaped}($|\\s|-|/|\\(|\\)|,|\\.)`, 'i');

    if (normalizedTags.some((tag) => tag === target || regex.test(tag))) {
      return true;
    }
    return regex.test(lowerText);
  });
}

function mapGenres(steamGenres, topTags, descText) {
  const strictTags = [...steamGenres, ...topTags.slice(0, 8)].filter(
    (t) => t.toLowerCase() !== 'esports'
  );
  let matched = GENRE_ENUM.filter((g) => textMatchesKeywords(strictTags, '', GENRE_KEYWORDS[g]));

  if (matched.length === 0) {
    matched = GENRE_ENUM.filter((g) => textMatchesKeywords(steamGenres, descText, GENRE_KEYWORDS[g]));
  }

  const isShooter = textMatchesKeywords([...steamGenres, ...topTags.slice(0, 8)], '', GENRE_KEYWORDS.FPS);
  if (isShooter) {
    matched = matched.filter((g) => g !== 'Sports' && g !== 'Racing');
    if (!matched.includes('FPS')) matched.unshift('FPS');
  }

  return matched.length ? matched : ['Adventure'];
}

function mapMood(topTags, descText, categoriesText) {
  const combinedText = `${descText} ${categoriesText}`;
  const matched = Object.keys(MOOD_KEYWORDS).filter((m) =>
    textMatchesKeywords(topTags, combinedText, MOOD_KEYWORDS[m])
  );
  return matched.length ? matched : ['Casual'];
}

function mapTheme(topTags, descText, genres) {
  const matched = Object.keys(THEME_KEYWORDS).filter((t) =>
    textMatchesKeywords(topTags, descText, THEME_KEYWORDS[t])
  );
  if (matched.length) return matched;
  if (genres.includes('Sports') || genres.includes('Racing')) return ['Modern'];
  return ['Modern'];
}

function mapGraphics(topTags, descText) {
  for (const style of ['Pixel', 'Anime', 'Cartoon', 'Realistic']) {
    if (textMatchesKeywords(topTags, descText, GRAPHICS_KEYWORDS[style])) {
      return style;
    }
  }
  return 'Realistic';
}

function mapDifficulty(topTags, descText) {
  if (textMatchesKeywords(topTags, descText, ['souls-like', 'difficult', 'punishing', 'hardcore', 'brutal', 'permadeath'])) {
    return 'Hard';
  }
  if (textMatchesKeywords(topTags, descText, ['casual', 'easy', 'relaxing', 'cozy', 'wholesome', 'family friendly'])) {
    return 'Easy';
  }
  return 'Medium';
}

function mapMultiplayer(categories, topTags = [], descText = '') {
  const names = categories.map((c) => c.description.toLowerCase());
  const tagNames = topTags.map((t) => t.toLowerCase());
  const lowerDesc = descText.toLowerCase();
  const modes = [];

  if (names.some((n) => n.includes('single-player')) || tagNames.includes('singleplayer') || lowerDesc.includes('single-player')) {
    modes.push('Solo');
  }
  if (names.some((n) => n.includes('co-op')) || tagNames.some((t) => t.includes('co-op')) || lowerDesc.includes('co-op')) {
    modes.push('Coop');
  }
  if (names.some((n) => n.includes('pvp') || n.includes('multi-player')) || tagNames.includes('multiplayer') || tagNames.includes('pvp')) {
    modes.push('PvP');
  }
  return modes.length ? modes : ['Solo'];
}

function parseReleaseYear(dateStr) {
  if (!dateStr) return new Date().getFullYear();
  const yearMatch = String(dateStr).match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) return parseInt(yearMatch[1], 10);
  const parsed = new Date(dateStr).getFullYear();
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
}

function extractPriceTHB(storeData, spy, isFree) {
  if (isFree) return 0;
  // Steam Store (cc=TH) ส่งราคามาเป็นหน่วยสตางค์ (เช่น 35000 = 350 บาท)
  if (storeData?.price_overview?.final) {
    const currency = storeData.price_overview.currency || 'THB';
    const rawAmount = Math.round(storeData.price_overview.final / 100);
    return currency === 'USD' ? Math.round(rawAmount * 34) : rawAmount;
  }
  // กรณีใช้ข้อมูลสำรองจาก SteamSpy (หน่วยเป็น US Cents)
  if (spy?.price && Number(spy.price) > 0) {
    const usd = Number(spy.price) / 100;
    return Math.round(usd * 34);
  }
  return 450; // ค่าเฉลี่ยเริ่มต้นสำหรับเกมเสียเงินที่ไม่มีข้อมูลราคา
}

function buildGame(id, spy, storeData, searchHints = {}) {
  const allTags = spy && spy.tags ? Object.keys(spy.tags) : [];
  const topTags = allTags.slice(0, 12);
  const steamGenres = (storeData?.genres || []).map((g) => g.description);
  const categories = storeData?.categories || [];
  const categoriesText = categories.map((c) => c.description).join(' ');

  const rawDesc = `${storeData?.name || ''} ${storeData?.short_description || ''} ${stripHtml(storeData?.detailed_description || '').slice(0, 1200)}`;
  const genre = mapGenres(steamGenres, topTags, rawDesc);

  const theme = mapTheme(topTags, rawDesc, genre);
  if (searchHints.theme && !theme.includes(searchHints.theme) && textMatchesKeywords(topTags, rawDesc, THEME_KEYWORDS[searchHints.theme] || [])) {
    theme.push(searchHints.theme);
  }

  const year = parseReleaseYear(storeData?.release_date?.date);

  let isFree = false;
  if (storeData) {
    isFree = Boolean(storeData.is_free) || (!storeData.price_overview && textMatchesKeywords([...steamGenres, ...allTags], '', ['free to play']));
  } else if (spy) {
    isFree = spy.price === '0' || spy.price === 0;
  }

  const priceTHB = extractPriceTHB(storeData, spy, isFree);
  const priceLabel = isFree ? 'Free' : `฿${priceTHB.toLocaleString()}`;

  let description = (storeData?.short_description || spy?.name || '').trim();
  if (description.length > 160) description = description.slice(0, 157) + '...';

  const appid = storeData?.steam_appid || spy?.appid || id;
  const image = storeData?.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
  const storeUrl = `https://store.steampowered.com/app/${appid}`;

  return {
    id,
    appid,
    name: storeData?.name || spy?.name,
    description,
    image,
    storeUrl,
    genre,
    mood: mapMood(topTags, rawDesc, categoriesText),
    theme,
    multiplayer: mapMultiplayer(categories, topTags, rawDesc),
    platform: ['PC'],
    difficulty: mapDifficulty(topTags, rawDesc),
    graphics: mapGraphics(topTags, rawDesc),
    price: isFree ? 'Free' : priceLabel,
    priceType: isFree ? 'Free' : 'Paid',
    priceTHB,
    year,
  };
}

// ---------- 3. ฟังก์ชันอ่าน/บันทึกไฟล์ seed/games.json ----------
function sanitizeExistingGames(games) {
  let modified = false;
  const cleaned = games.map((g) => {
    let updated = { ...g };
    if (Array.isArray(updated.genre)) {
      const isFpsGame = updated.genre.includes('FPS') || /counter-strike|rainbow six|valorant|apex legends|pubg|call of duty/i.test(updated.name || '');
      if (isFpsGame && updated.genre.includes('Sports')) {
        modified = true;
        updated.genre = updated.genre.filter((tag) => tag !== 'Sports');
      }
    }
    if (!Array.isArray(updated.theme)) {
      updated.theme = mapTheme([], updated.description || '', updated.genre || []);
      modified = true;
    }
    if (typeof updated.priceTHB !== 'number') {
      const isFree = updated.price === 'Free';
      updated.priceTHB = isFree ? 0 : 450;
      updated.priceType = isFree ? 'Free' : 'Paid';
      modified = true;
    }
    return updated;
  });

  if (modified) saveGamesToSeed(cleaned);
  return cleaned;
}

function getLatestGames() {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const raw = fs.readFileSync(SEED_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeExistingGames(parsed);
      }
    }
  } catch (err) {
    console.error('Read seed error:', err.message);
  }
  return sanitizeExistingGames(store.getAllGames());
}

function saveGamesToSeed(games) {
  try {
    fs.writeFileSync(SEED_FILE, JSON.stringify(games, null, 2));
  } catch (err) {
    console.error('Save seed error:', err.message);
  }
}

// ---------- 4. ระบบดึงเกมจาก Steam (ใช้ cc=TH เพื่อดึงราคาเงินบาท) ----------
async function fetchJsonWithTimeout(url, timeoutMs = 4500) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchGameDetailsRealtime(appid, nextId, searchHints = {}) {
  const [spy, storeRaw] = await Promise.all([
    fetchJsonWithTimeout(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`),
    fetchJsonWithTimeout(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=TH`),
  ]);

  const storeData = storeRaw?.[appid]?.success ? storeRaw[appid].data : null;
  if ((storeData && storeData.type !== 'game') || (!spy && !storeData)) return null;
  if (!storeData?.name && !spy?.name) return null;

  return buildGame(nextId, spy, storeData, searchHints);
}

function buildDynamicSearchQueries(answers) {
  const userGenres = toArray(answers.genre);
  const targetGenres = userGenres.length ? userGenres : ['Adventure'];
  const userThemes = toArray(answers.theme).filter((t) => t !== 'Any');
  const priceRange = answers.priceRange || answers.price || 'Any';
  const graphicsMod = answers.graphics && answers.graphics !== 'Any' ? SEARCH_MODIFIERS.graphics[answers.graphics] : '';
  const moodMod = answers.mood && answers.mood !== 'Any' ? SEARCH_MODIFIERS.mood[answers.mood] : '';
  const multiMod = answers.multiplayer && answers.multiplayer !== 'Any' ? SEARCH_MODIFIERS.multiplayer[answers.multiplayer] : '';
  const customKw = (answers.customKeyword || '').trim();

  const queries = [];

  // ถ้าผู้ใช้พิมพ์คำค้นพิเศษมา ให้ค้นหาคำนั้นบน Steam เป็นอันดับแรก!
  if (customKw) {
    queries.push(customKw);
    for (const genre of targetGenres) {
      queries.push(`${genre} ${customKw}`.trim());
    }
  }

  for (const genre of targetGenres) {
    if (graphicsMod) queries.push(`${genre} ${graphicsMod}`.trim());
    for (const t of userThemes) {
      const themeMod = SEARCH_MODIFIERS.theme[t] || t;
      queries.push(`${genre} ${themeMod}`.trim());
    }
    if (moodMod) queries.push(`${genre} ${moodMod}`.trim());
    if (multiMod) queries.push(`${genre} ${multiMod}`.trim());

    const isFreeWanted = priceRange === 'Free' || answers.maxPriceTHB === 0;
    const fallbackPool = isFreeWanted
      ? (FREE_GENRE_TERMS[genre] || [`${genre} Free`])
      : (FALLBACK_GENRE_TERMS[genre] || [genre]);

    queries.push(...fallbackPool.slice(0, 4));
  }

  return Array.from(new Set(queries)).slice(0, 8);
}

async function fetchMatchingGamesFromSteam(answers, existingGames) {
  const userGenres = toArray(answers.genre);
  const targetGenres = userGenres.length ? userGenres : ['Adventure'];
  const priceRange = answers.priceRange || answers.price || 'Any';
  const maxTHB = typeof answers.maxPriceTHB === 'number' ? answers.maxPriceTHB : null;

  const existingNames = new Set(existingGames.map((g) => (g.name || '').toLowerCase().trim()));
  const existingAppIds = new Set(existingGames.map((g) => Number(g.appid || g.id)));
  const candidateAppIds = [];

  const searchQueries = buildDynamicSearchQueries(answers);

  const searchResults = await Promise.all(
    searchQueries.map((term) =>
      fetchJsonWithTimeout(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=TH`
      )
    )
  );

  for (const searchData of searchResults) {
    if (!searchData?.items) continue;
    for (const item of searchData.items.slice(0, 5)) {
      const itemName = (item.name || '').toLowerCase().trim();
      if (item.type !== 'app' || existingNames.has(itemName) || existingAppIds.has(Number(item.id))) {
        continue;
      }

      const itemPriceTHB = item.price ? Math.round(item.price.final / 100) : 0;
      if (maxTHB !== null && itemPriceTHB > maxTHB) continue;
      if (priceRange === 'Free' && itemPriceTHB > 0) continue;
      if (priceRange === 'Under350' && itemPriceTHB > 350) continue;
      if (priceRange === 'Under800' && itemPriceTHB > 800) continue;
      if ((priceRange === 'PaidAll' || priceRange === 'Paid') && itemPriceTHB === 0) continue;

      if (!candidateAppIds.includes(item.id)) {
        candidateAppIds.push(item.id);
      }
    }
  }

  const toFetch = candidateAppIds.slice(0, 10);
  if (!toFetch.length) return existingGames;

  let maxId = existingGames.reduce((max, g) => Math.max(max, g.id || 0), 0);
  const firstTheme = toArray(answers.theme).find((t) => t !== 'Any') || null;

  const fetchedGames = await Promise.all(
    toFetch.map((appid, idx) =>
      fetchGameDetailsRealtime(appid, maxId + idx + 1, { theme: firstTheme })
    )
  );

  const validNewGames = fetchedGames.filter(
    (g) => g && g.genre.some((tag) => targetGenres.includes(tag))
  );

  if (validNewGames.length > 0) {
    const updatedGames = [...existingGames, ...validNewGames];
    saveGamesToSeed(updatedGames);
    return updatedGames;
  }

  return existingGames;
}

// ---------- 5. Rule-based matching engine ----------
const WEIGHTS = {
  genre: 5,
  multiplayer: 4,
  theme: 4,
  graphics: 4,
  mood: 3,
  priceRange: 4,
  yearRange: 4,
  customKeyword: 5,
  platform: 2,
};

function toArray(v) {
  if (v === undefined || v === null || v === '') return [];
  return Array.isArray(v) ? v : [v];
}

function getEffectiveWeight(field, answers) {
  const base = WEIGHTS[field] || 2;
  return answers.priorityField === field ? base * 2 : base;
}

function checkPriceMatch(game, priceRange, maxPriceTHB) {
  const thb = typeof game.priceTHB === 'number' ? game.priceTHB : (game.price === 'Free' ? 0 : 450);
  if (typeof maxPriceTHB === 'number') {
    return {
      ok: thb <= maxPriceTHB,
      label: maxPriceTHB === 0 ? 'เล่นฟรี (0 บาท)' : `อยู่ในงบ ฿${maxPriceTHB.toLocaleString()} (${thb === 0 ? 'ฟรี' : '฿' + thb})`,
    };
  }
  if (priceRange === 'Free') return { ok: thb === 0, label: 'เล่นฟรี (0 บาท)' };
  if (priceRange === 'Under350') return { ok: thb <= 350, label: `อยู่ในงบไม่เกิน 350 บาท (${thb === 0 ? 'ฟรี' : '฿' + thb})` };
  if (priceRange === 'Under800') return { ok: thb <= 800, label: `อยู่ในงบไม่เกิน 800 บาท (${thb === 0 ? 'ฟรี' : '฿' + thb})` };
  if (priceRange === 'PaidAll' || priceRange === 'Paid') return { ok: thb > 0, label: `เกมซื้อขาดพรีเมียม (฿${thb})` };
  return { ok: true, label: '' };
}

function checkYearMatch(game, yearRange, minYear) {
  const y = Number(game.year) || 2022;
  if (typeof minYear === 'number' && minYear > 2000) {
    return { ok: y >= minYear, label: `วางจำหน่ายปี ${y} (ตั้งแตปี ${minYear}+)` };
  }
  if (yearRange === 'New_2023_Now') return { ok: y >= 2023, label: `เกมยุคใหม่ (${y})` };
  if (yearRange === 'Modern_2018_2022') return { ok: y >= 2018 && y <= 2022, label: `เกมยุค 2018–2022 (${y})` };
  if (yearRange === 'Classic_Before_2018') return { ok: y < 2018, label: `เกมคลาสสิกขึ้นหิ้ง (${y})` };
  return { ok: true, label: '' };
}

function scoreGame(game, answers, strictMode = true) {
  let score = 0;
  const reasons = [];

  // 1. แนวเกมหลัก
  const userGenres = toArray(answers.genre);
  if (userGenres.length) {
    const overlap = (game.genre || []).filter((g) => userGenres.includes(g));
    if (overlap.length === 0) return { score: 0, reasons: [] };
    score += overlap.length * getEffectiveWeight('genre', answers);
    reasons.push(`ตรงแนวเกม: ${overlap.join(', ')}`);
  }

  // 2. แพลตฟอร์ม
  const userPlatforms = toArray(answers.platform);
  if (userPlatforms.length) {
    const overlap = (game.platform || []).filter((p) => userPlatforms.includes(p));
    if (overlap.length === 0) return { score: 0, reasons: [] };
    score += overlap.length * WEIGHTS.platform;
  }

  // 3. ช่วงงบประมาณราคา (รองรับทั้งปุ่มและ Slider)
  const priceChoice = answers.priceRange || answers.price;
  const hasCustomMaxPrice = typeof answers.maxPriceTHB === 'number';
  if ((priceChoice && priceChoice !== 'Any') || hasCustomMaxPrice) {
    const priceCheck = checkPriceMatch(game, priceChoice, answers.maxPriceTHB);
    if (!priceCheck.ok) return { score: 0, reasons: [] };
    score += WEIGHTS.priceRange;
    if (priceCheck.label) reasons.push(`ราคาตรงงบ: ${priceCheck.label}`);
  }

  // 4. ปีที่วางจำหน่าย (รองรับทั้งปุ่มและ Slider)
  const yearChoice = answers.yearRange;
  const hasCustomMinYear = typeof answers.minYear === 'number' && answers.minYear > 2000;
  if ((yearChoice && yearChoice !== 'Any') || hasCustomMinYear) {
    const yearCheck = checkYearMatch(game, yearChoice, answers.minYear);
    if (yearCheck.ok) {
      score += WEIGHTS.yearRange;
      if (yearCheck.label) reasons.push(`ปีที่วางขาย: ${yearCheck.label}`);
    } else if (strictMode) {
      return { score: 0, reasons: [] };
    }
  }

  // 5. รูปแบบผู้เล่น
  const userMulti = answers.multiplayer;
  if (userMulti && userMulti !== 'Any') {
    if ((game.multiplayer || []).includes(userMulti)) {
      score += getEffectiveWeight('multiplayer', answers);
      reasons.push(`รูปแบบผู้เล่นตรงกัน: ${userMulti}`);
    } else if (strictMode) {
      return { score: 0, reasons: [] };
    }
  }

  // 6. ธีมโลกของเกม
  const userThemes = toArray(answers.theme).filter((t) => t !== 'Any');
  if (userThemes.length) {
    const gameThemes = game.theme || [];
    const overlap = gameThemes.filter((t) => userThemes.includes(t));
    if (overlap.length > 0) {
      score += overlap.length * getEffectiveWeight('theme', answers);
      reasons.push(`ธีมของเกมตรงใจ: ${overlap.join(', ')}`);
    }
  }

  // 7. สไตล์กราฟิก
  const userGraphics = answers.graphics;
  if (userGraphics && userGraphics !== 'Any') {
    if (userGraphics === game.graphics) {
      score += getEffectiveWeight('graphics', answers);
      reasons.push(`สไตล์กราฟิกตรงกัน: ${game.graphics}`);
    }
  }

  // 8. อารมณ์การเล่น
  const userMood = answers.mood;
  if (userMood && userMood !== 'Any') {
    if ((game.mood || []).includes(userMood)) {
      score += getEffectiveWeight('mood', answers);
      reasons.push(`อารมณ์การเล่นตรงกัน: ${userMood}`);
    }
  }

  // 9. คำค้นพิเศษ (Custom Keyword)
  const customKw = (answers.customKeyword || '').trim().toLowerCase();
  if (customKw) {
    const searchable = `${game.name || ''} ${game.description || ''} ${(game.genre || []).join(' ')} ${(game.theme || []).join(' ')}`.toLowerCase();
    if (searchable.includes(customKw)) {
      score += WEIGHTS.customKeyword;
      reasons.push(`ตรงกับคำค้นพิเศษ: "${answers.customKeyword.trim()}"`);
    }
  }

  return { score, reasons };
}

function maxPossibleScore(answers) {
  let max = 0;
  if (toArray(answers.genre).length) max += toArray(answers.genre).length * getEffectiveWeight('genre', answers);
  if (toArray(answers.platform).length) max += toArray(answers.platform).length * WEIGHTS.platform;
  const priceChoice = answers.priceRange || answers.price;
  if ((priceChoice && priceChoice !== 'Any') || typeof answers.maxPriceTHB === 'number') max += WEIGHTS.priceRange;
  if ((answers.yearRange && answers.yearRange !== 'Any') || (typeof answers.minYear === 'number' && answers.minYear > 2000)) max += WEIGHTS.yearRange;
  if (answers.multiplayer && answers.multiplayer !== 'Any') max += getEffectiveWeight('multiplayer', answers);
  const userThemes = toArray(answers.theme).filter((t) => t !== 'Any');
  if (userThemes.length) max += userThemes.length * getEffectiveWeight('theme', answers);
  if (answers.graphics && answers.graphics !== 'Any') max += getEffectiveWeight('graphics', answers);
  if (answers.mood && answers.mood !== 'Any') max += getEffectiveWeight('mood', answers);
  if ((answers.customKeyword || '').trim()) max += WEIGHTS.customKeyword;
  return max || 1;
}

// ---------- 6. Routes ----------
router.get('/games', (req, res) => {
  const games = getLatestGames();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || games.length, 1), games.length || 1);
  const start = (page - 1) * limit;

  res.json({
    page,
    limit,
    total: games.length,
    items: games.slice(start, start + limit),
  });
});

router.get('/games/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const games = getLatestGames();
  const game = games.find((g) => g.id === id);
  if (!game) return res.status(404).json({ error: 'ไม่พบเกมนี้ในฐานข้อมูล' });
  res.json({ game });
});

router.get('/meta/options', (req, res) => {
  res.json({
    genre: ['RPG', 'FPS', 'Puzzle', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Horror', 'Adventure', 'Fighting', 'Sandbox'],
    mood: ['Relaxing', 'Competitive', 'StoryDriven', 'Casual', 'Hardcore', 'Any'],
    theme: ['Fantasy', 'SciFi', 'Zombie', 'Cyberpunk', 'Medieval', 'Modern', 'Any'],
    multiplayer: ['Solo', 'Coop', 'PvP', 'Any'],
    graphics: ['Realistic', 'Pixel', 'Cartoon', 'Anime', 'Any'],
    priceRange: ['Free', 'Under350', 'Under800', 'PaidAll', 'Any'],
    yearRange: ['New_2023_Now', 'Modern_2018_2022', 'Classic_Before_2018', 'Any'],
  });
});

router.post('/match', async (req, res) => {
  try {
    const answers = req.body || {};
    let games = getLatestGames();
    const ceiling = maxPossibleScore(answers);

    const strictMatchesInStore = games.filter((game) => {
      const { score } = scoreGame(game, answers, true);
      return score > 0;
    });

    if (strictMatchesInStore.length < 6) {
      games = await fetchMatchingGamesFromSteam(answers, games);
    }

    let results = games
      .map((game) => {
        const { score, reasons } = scoreGame(game, answers, true);
        return {
          game,
          score,
          matchPercent: Math.min(100, Math.round((score / ceiling) * 100)),
          reasons,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // ถ้ากรองปี+โหมดผู้เล่นแบบเข้มงวดแล้วเจอเกมน้อยกว่า 3 เกม ให้ผ่อนปรนปีที่วางขายเพื่อแสดงตัวเลือกใกล้เคียงเพิ่ม
    if (results.length < 3) {
      results = games
        .map((game) => {
          const { score, reasons } = scoreGame(game, answers, false);
          return {
            game,
            score,
            matchPercent: Math.min(100, Math.round((score / ceiling) * 100)),
            reasons,
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    }

    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const payload = jwt.verify(token, JWT_SECRET);

        const matches = store.getAllMatches();
        matches.push({
          id: store.nextMatchId(matches),
          userId: payload.id,
          answers,
          topGameIds: results.map((r) => r.game.id),
          createdAt: new Date().toISOString(),
        });
        store.saveAllMatches(matches);
      } catch (e) {
        // skip history save on invalid token
      }
    }

    res.json({ results });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลและจับคู่เกม' });
  }
});

router.get('/match/history', authRequired, (req, res) => {
  const matches = store.getAllMatches().filter((m) => m.userId === req.user.id);
  const games = getLatestGames();

  const enriched = matches
    .slice()
    .reverse()
    .map((m) => ({
      ...m,
      topGames: m.topGameIds.map((id) => games.find((g) => g.id === id)).filter(Boolean),
    }));

  res.json({ items: enriched });
});

module.exports = router;