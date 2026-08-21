const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SEED_DIR = path.join(__dirname, '..', 'seed');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const GAMES_FILE = path.join(SEED_DIR, 'games.json');

function ensureFile(file, initial) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
  }
}

ensureFile(USERS_FILE, []);
ensureFile(MATCHES_FILE, []);

function readJSON(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJSON(file, data) {
  // atomic-ish write: write to tmp then rename
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// ---- Users ----
function getAllUsers() {
  return readJSON(USERS_FILE);
}

function saveAllUsers(users) {
  writeJSON(USERS_FILE, users);
}

function nextUserId(users) {
  return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

// ---- Matches (quiz history) ----
function getAllMatches() {
  return readJSON(MATCHES_FILE);
}

function saveAllMatches(matches) {
  writeJSON(MATCHES_FILE, matches);
}

function nextMatchId(matches) {
  return matches.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

// ---- Games (read-only curated database, shipped with the image) ----
function getAllGames() {
  return readJSON(GAMES_FILE);
}

module.exports = {
  getAllUsers,
  saveAllUsers,
  nextUserId,
  getAllMatches,
  saveAllMatches,
  nextMatchId,
  getAllGames,
};
