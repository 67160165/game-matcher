const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { authRequired, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// POST /api/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอก username, email, password ให้ครบ' });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'username ต้องยาว 3-20 ตัวอักษร (a-z, 0-9, _)' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'รูปแบบ email ไม่ถูกต้อง' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password ต้องยาวอย่างน้อย 6 ตัวอักษร' });
  }

  const users = store.getAllUsers();

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'username นี้ถูกใช้แล้ว' });
  }
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'email นี้ถูกใช้แล้ว' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: store.nextUserId(users),
    username,
    email,
    passwordHash,
    role: users.length === 0 ? 'admin' : 'user', // first registered user becomes admin
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  store.saveAllUsers(users);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ user: publicUser(newUser), token });
});

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'กรุณากรอก username และ password' });
  }

  const users = store.getAllUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() ||
           u.email.toLowerCase() === username.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'username หรือ password ไม่ถูกต้อง' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ user: publicUser(user), token });
});

// POST /api/logout
// JWTs are stateless, so logout is handled client-side by discarding the token.
// This endpoint exists for API completeness / future token-blacklist support.
router.post('/logout', authRequired, (req, res) => {
  res.json({ message: 'ออกจากระบบเรียบร้อยแล้ว' });
});

// POST /api/change-password
router.post('/change-password', authRequired, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่านเก่าและรหัสผ่านใหม่' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร' });
  }

  const users = store.getAllUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }
  if (!bcrypt.compareSync(oldPassword, user.passwordHash)) {
    return res.status(401).json({ error: 'รหัสผ่านเก่าไม่ถูกต้อง' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  store.saveAllUsers(users);

  res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
});

module.exports = router;
