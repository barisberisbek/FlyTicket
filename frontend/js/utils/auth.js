const USER_KEY = 'flyticket_user_token';
const USER_DATA = 'flyticket_user_data';
const ADMIN_KEY = 'flyticket_admin_token';
const ADMIN_DATA = 'flyticket_admin_data';

export function setUserSession(token, user) {
  localStorage.setItem(USER_KEY, token);
  localStorage.setItem(USER_DATA, JSON.stringify(user));
}
export function getUserToken() { return localStorage.getItem(USER_KEY); }
export function getCurrentUser() {
  const raw = localStorage.getItem(USER_DATA);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function logoutUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_DATA);
}

export function setAdminSession(token, admin) {
  localStorage.setItem(ADMIN_KEY, token);
  localStorage.setItem(ADMIN_DATA, JSON.stringify(admin));
}
export function getAdminToken() { return localStorage.getItem(ADMIN_KEY); }
export function getCurrentAdmin() {
  const raw = localStorage.getItem(ADMIN_DATA);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(ADMIN_DATA);
}

export function requireAdmin() {
  if (!getAdminToken()) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}
