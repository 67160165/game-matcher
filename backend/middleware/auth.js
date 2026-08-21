const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function authRequired(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'ต้องเข้าสู่ระบบก่อน (missing token)' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

// only allows the resource owner or an admin
function ownerOrAdmin(req, res, next) {
  const targetId = parseInt(req.params.id, 10);
  if (req.user.role === 'admin' || req.user.id === targetId) {
    return next();
  }
  return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้' });
}

module.exports = { authRequired, ownerOrAdmin, JWT_SECRET };
