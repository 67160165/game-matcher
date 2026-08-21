const express = require('express');
const store = require('../db/store');
const { authRequired, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// GET /api/check-username/:name  (public, used before submitting register form)
router.get('/check-username/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const users = store.getAllUsers();
  const taken = users.some((u) => u.username.toLowerCase() === name);
  res.json({ username: req.params.name, available: !taken });
});

// GET /api/me
router.get('/me', authRequired, (req, res) => {
  const users = store.getAllUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  res.json({ user: publicUser(user) });
});

// GET /api/users  (pagination) -- admin only
router.get('/users', authRequired, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'เฉพาะ admin เท่านั้น' });
  }
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const users = store.getAllUsers();

  const start = (page - 1) * limit;
  const items = users.slice(start, start + limit).map(publicUser);

  res.json({
    page,
    limit,
    total: users.length,
    totalPages: Math.ceil(users.length / limit),
    items,
  });
});

// GET /api/users/:id
router.get('/users/:id', authRequired, ownerOrAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = store.getAllUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  res.json({ user: publicUser(user) });
});

// PUT /api/users/:id
router.put('/users/:id', authRequired, ownerOrAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = store.getAllUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

  const { email, displayName } = req.body || {};
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email !== undefined) {
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'รูปแบบ email ไม่ถูกต้อง' });
    }
    const emailTaken = users.some(
      (u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailTaken) {
      return res.status(409).json({ error: 'email นี้ถูกใช้แล้ว' });
    }
    user.email = email;
  }
  if (displayName !== undefined) {
    user.displayName = displayName;
  }

  store.saveAllUsers(users);
  res.json({ user: publicUser(user) });
});

// DELETE /api/users/:id
router.delete('/users/:id', authRequired, ownerOrAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const users = store.getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });

  users.splice(idx, 1);
  store.saveAllUsers(users);
  res.json({ message: 'ลบผู้ใช้เรียบร้อยแล้ว' });
});

module.exports = router;
