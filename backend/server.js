require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', gameRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- Serve frontend (static site) ----
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// SPA-style fallback for any non-API GET route -> serve index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
});

app.listen(PORT, () => {
  console.log(`🎮 Game Matcher API running on http://localhost:${PORT}`);
});
