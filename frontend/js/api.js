const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('gm_token');
}

function setSession(token, user) {
  localStorage.setItem('gm_token', token);
  localStorage.setItem('gm_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('gm_token');
  localStorage.removeItem('gm_user');
}

function getCurrentUser() {
  const raw = localStorage.getItem('gm_user');
  return raw ? JSON.parse(raw) : null;
}

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    throw new Error(data.error || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return data;
}

// Renders the shared navbar into any element with id="navbar"
function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;
  const user = getCurrentUser();

  el.innerHTML = `
    <a href="/index.html" class="logo">🎮 GameMatch</a>
    <nav>
      <a href="/quiz.html">หาเกมที่ใช่</a>
      ${user ? `
        <a href="/profile.html">โปรไฟล์</a>
        ${user.role === 'admin' ? '<a href="/admin.html">Admin</a>' : ''}
        <a href="#" id="nav-logout">ออกจากระบบ (${user.username})</a>
      ` : `
        <a href="/login.html">เข้าสู่ระบบ</a>
        <a href="/register.html" class="btn btn-primary" style="padding:8px 16px;">สมัครสมาชิก</a>
      `}
    </nav>
  `;

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await apiRequest('/logout', { method: 'POST', auth: true }); } catch (err) { /* ignore */ }
      clearSession();
      window.location.href = '/index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNavbar);
