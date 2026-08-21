const express = require('express');
const store = require('../db/store');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ---------- Rule-based matching engine ----------
// Weights: how much each answered dimension contributes to the total score.
const WEIGHTS = {
  genre: 3,        // per matching genre tag
  mood: 3,
  multiplayer: 2,
  platform: 2,      // per matching platform tag
  sessionLength: 1,
  difficulty: 1,
  graphics: 1,
  price: 1,
};

function toArray(v) {
  if (v === undefined || v === null || v === '') return [];
  return Array.isArray(v) ? v : [v];
}

function scoreGame(game, answers) {
  let score = 0;
  const reasons = [];

  // genre: multi-select on both sides, score per overlapping tag
  const userGenres = toArray(answers.genre);
  if (userGenres.length) {
    const overlap = game.genre.filter((g) => userGenres.includes(g));
    if (overlap.length) {
      score += overlap.length * WEIGHTS.genre;
      reasons.push(`ตรงแนวเกม: ${overlap.join(', ')}`);
    }
  }

  // mood: single choice from user, game can have multiple moods
  const userMood = answers.mood;
  if (userMood && game.mood.includes(userMood)) {
    score += WEIGHTS.mood;
    reasons.push(`อารมณ์การเล่นตรงกัน: ${userMood}`);
  }

  // multiplayer: 'Any' matches everything
  const userMulti = answers.multiplayer;
  if (userMulti) {
    if (userMulti === 'Any' || game.multiplayer.includes(userMulti)) {
      score += WEIGHTS.multiplayer;
      reasons.push('รูปแบบผู้เล่นตรงกัน');
    }
  }

  // platform: multi-select on user side
  const userPlatforms = toArray(answers.platform);
  if (userPlatforms.length) {
    const overlap = game.platform.filter((p) => userPlatforms.includes(p));
    if (overlap.length) {
      score += overlap.length * WEIGHTS.platform;
      reasons.push(`เล่นได้บนแพลตฟอร์มของคุณ: ${overlap.join(', ')}`);
    }
  }

  // sessionLength
  const userSession = answers.sessionLength;
  if (userSession && game.sessionLength.includes(userSession)) {
    score += WEIGHTS.sessionLength;
    reasons.push('ระยะเวลาเล่นเหมาะสม');
  }

  // difficulty: 'Any' matches everything
  const userDifficulty = answers.difficulty;
  if (userDifficulty) {
    if (userDifficulty === 'Any' || userDifficulty === game.difficulty) {
      score += WEIGHTS.difficulty;
      reasons.push(`ความยากตรงกัน: ${game.difficulty}`);
    }
  }

  // graphics
  const userGraphics = answers.graphics;
  if (userGraphics) {
    if (userGraphics === 'Any' || userGraphics === game.graphics) {
      score += WEIGHTS.graphics;
      reasons.push(`สไตล์กราฟิกตรงกัน: ${game.graphics}`);
    }
  }

  // price
  const userPrice = answers.price;
  if (userPrice) {
    if (userPrice === 'Any' || userPrice === game.price) {
      score += WEIGHTS.price;
      reasons.push(`ราคาตรงกับที่ต้องการ: ${game.price}`);
    }
  }

  return { score, reasons };
}

function maxPossibleScore(answers) {
  // theoretical ceiling used to compute a 0-100% match value
  let max = 0;
  if (toArray(answers.genre).length) max += toArray(answers.genre).length * WEIGHTS.genre;
  if (answers.mood) max += WEIGHTS.mood;
  if (answers.multiplayer) max += WEIGHTS.multiplayer;
  if (toArray(answers.platform).length) max += toArray(answers.platform).length * WEIGHTS.platform;
  if (answers.sessionLength) max += WEIGHTS.sessionLength;
  if (answers.difficulty) max += WEIGHTS.difficulty;
  if (answers.graphics) max += WEIGHTS.graphics;
  if (answers.price) max += WEIGHTS.price;
  return max || 1;
}

// GET /api/games  -- list curated database (with optional pagination)
router.get('/games', (req, res) => {
  const games = store.getAllGames();
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

// GET /api/games/:id
router.get('/games/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const games = store.getAllGames();
  const game = games.find((g) => g.id === id);
  if (!game) return res.status(404).json({ error: 'ไม่พบเกมนี้ในฐานข้อมูล' });
  res.json({ game });
});

// GET /api/games/meta/options -- available quiz answer options (drives the frontend form)
router.get('/meta/options', (req, res) => {
  res.json({
    genre: ['RPG', 'FPS', 'Puzzle', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Horror', 'Adventure', 'Fighting', 'Sandbox'],
    mood: ['Relaxing', 'Competitive', 'StoryDriven', 'Casual', 'Hardcore'],
    multiplayer: ['Solo', 'Coop', 'PvP', 'Any'],
    platform: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'],
    sessionLength: ['Short', 'Long'],
    difficulty: ['Easy', 'Medium', 'Hard', 'Any'],
    graphics: ['Realistic', 'Pixel', 'Cartoon', 'Anime', 'Any'],
    price: ['Free', 'Paid', 'Any'],
  });
});

// POST /api/match -- run the rule-based matching engine.
// Works for guests; if logged in (Authorization header present) the result is saved to history.
router.post('/match', (req, res) => {
  const answers = req.body || {};
  const games = store.getAllGames();
  const ceiling = maxPossibleScore(answers);

  const results = games
    .map((game) => {
      const { score, reasons } = scoreGame(game, answers);
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

  // optionally save to history if a valid token was sent
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
      // invalid/expired token on a public endpoint - just skip saving history
    }
  }

  res.json({ results });
});

// GET /api/match/history -- logged-in user's past quiz results
router.get('/match/history', authRequired, (req, res) => {
  const matches = store.getAllMatches().filter((m) => m.userId === req.user.id);
  const games = store.getAllGames();

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
