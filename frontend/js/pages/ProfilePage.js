import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { Toast } from '../components/Toast.js';
import { fmtPrice } from '../utils/format.js';
import { getCurrentUser, setUserSession, getUserToken } from '../utils/auth.js';

mountChrome();
const host = appHost();

const user = getCurrentUser();
if (!getUserToken() || !user) {
  host.innerHTML = `<div class="alert alert-warning">Please <a href="login.html">log in</a> to view your profile.</div>`;
  throw new Error('not logged in');
}

host.innerHTML = `
  <div class="row g-4">
    <div class="col-12 col-md-3">
      <div class="card flight-card p-3 text-center mb-3">
        <div style="font-size:3rem">👤</div>
        <div class="fw-bold fs-5 mt-2" id="prof-name">${user.name} ${user.surname}</div>
        <div class="text-muted small">${user.email}</div>
      </div>
      <div class="ft-profile-tabs flex-column" style="border-bottom:none;border-right:2px solid var(--ft-card-border)">
        <button class="ft-profile-tab active text-start" data-tab="profile">👤 Profile</button>
        <button class="ft-profile-tab text-start" data-tab="security">🔒 Security</button>
        <button class="ft-profile-tab text-start" data-tab="cards">💳 My Cards</button>
        <button class="ft-profile-tab text-start" data-tab="stats">📊 Stats</button>
      </div>
    </div>
    <div class="col-12 col-md-9">
      <div id="tab-profile" class="tab-pane"></div>
      <div id="tab-security" class="tab-pane" style="display:none"></div>
      <div id="tab-cards" class="tab-pane" style="display:none"></div>
      <div id="tab-stats" class="tab-pane" style="display:none"></div>
    </div>
  </div>
`;

// Tab switching
document.querySelectorAll('.ft-profile-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ft-profile-tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach((p) => p.style.display = 'none');
    document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
    loadTab(btn.dataset.tab);
  });
});

const loaded = {};

function loadTab(tab) {
  if (loaded[tab]) return;
  loaded[tab] = true;
  if (tab === 'profile')  renderProfile();
  if (tab === 'security') renderSecurity();
  if (tab === 'cards')    renderCards();
  if (tab === 'stats')    renderStats();
}
loadTab('profile');

// ── Profile Tab ──────────────────────────────────────────────────────────────
function renderProfile() {
  const el = document.getElementById('tab-profile');
  el.innerHTML = `
    <h5 class="mb-3">Profile information</h5>
    <form id="ft-prof-form" class="card flight-card p-3">
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label">First name</label>
          <input class="form-control" id="prof-first" value="${user.name || ''}" required />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Surname</label>
          <input class="form-control" id="prof-last" value="${user.surname || ''}" required />
        </div>
        <div class="col-12">
          <label class="form-label">Email</label>
          <input class="form-control" value="${user.email || ''}" disabled />
          <div class="form-text">Email cannot be changed.</div>
        </div>
      </div>
      <div id="prof-err" class="alert alert-danger mt-3" style="display:none"></div>
      <div class="mt-3">
        <button class="btn btn-primary" type="submit" id="prof-save">Save changes</button>
      </div>
    </form>`;

  document.getElementById('ft-prof-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('prof-save');
    btn.disabled = true; btn.textContent = 'Saving...';
    const errEl = document.getElementById('prof-err');
    errEl.style.display = 'none';
    try {
      const { user: updated, token } = await api.put('/users/me', {
        name: document.getElementById('prof-first').value.trim(),
        surname: document.getElementById('prof-last').value.trim(),
      }, { auth: 'user' });
      if (token) setUserSession(token, updated);
      document.getElementById('prof-name').textContent = `${updated.name} ${updated.surname}`;
      Toast.show('Profile updated!', 'success');
    } catch (err) {
      errEl.textContent = err.message || 'Update failed';
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false; btn.textContent = 'Save changes';
    }
  });
}

// ── Security Tab ─────────────────────────────────────────────────────────────
function renderSecurity() {
  const el = document.getElementById('tab-security');
  el.innerHTML = `
    <h5 class="mb-3">Change password</h5>
    <form id="ft-sec-form" class="card flight-card p-3">
      <div class="mb-3">
        <label class="form-label">Current password</label>
        <input type="password" class="form-control" id="sec-cur" required />
      </div>
      <div class="mb-3">
        <label class="form-label">New password</label>
        <input type="password" class="form-control" id="sec-new" minlength="6" required />
        <div class="form-text">Minimum 6 characters.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">Confirm new password</label>
        <input type="password" class="form-control" id="sec-conf" required />
      </div>
      <div id="sec-err" class="alert alert-danger" style="display:none"></div>
      <button class="btn btn-primary" type="submit" id="sec-save">Change password</button>
    </form>`;

  document.getElementById('ft-sec-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('sec-err');
    errEl.style.display = 'none';
    const cur  = document.getElementById('sec-cur').value;
    const nw   = document.getElementById('sec-new').value;
    const conf = document.getElementById('sec-conf').value;
    if (nw !== conf) { errEl.textContent = 'New passwords do not match.'; errEl.style.display = 'block'; return; }
    const btn = document.getElementById('sec-save');
    btn.disabled = true; btn.textContent = 'Saving...';
    try {
      await api.put('/users/me/password', { currentPassword: cur, newPassword: nw }, { auth: 'user' });
      Toast.show('Password changed successfully!', 'success');
      document.getElementById('ft-sec-form').reset();
    } catch (err) {
      errEl.textContent = err.message || 'Password change failed';
      errEl.style.display = 'block';
    } finally { btn.disabled = false; btn.textContent = 'Change password'; }
  });
}

// ── Cards Tab ─────────────────────────────────────────────────────────────────
async function renderCards() {
  const el = document.getElementById('tab-cards');
  el.innerHTML = `<h5 class="mb-3">Saved cards</h5><div id="cards-list"><div class="spinner-border text-primary spinner-border-sm"></div></div>`;
  try {
    const { cards } = await api.get('/cards', { auth: 'user' });
    const listEl = document.getElementById('cards-list');
    if (!cards.length) {
      listEl.innerHTML = '<div class="alert alert-info small">No saved cards. Save a card after payment to enable quick checkout.</div>';
      return;
    }
    const ICONS = { visa: '💳 Visa', mastercard: '💳 Mastercard', amex: '💳 Amex', other: '💳 Card' };
    listEl.innerHTML = cards.map((c) => `
      <div class="d-flex align-items-center gap-3 card flight-card p-3 mb-2" data-card-id="${c.card_id}">
        <div class="fs-4">💳</div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${c.label}</div>
          <div class="small text-muted">${ICONS[c.card_type] || 'Card'} •••• ${c.last_four} · Exp ${c.expiry}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger del-card" data-id="${c.card_id}">Remove</button>
      </div>`).join('');

    listEl.querySelectorAll('.del-card').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this card?')) return;
        try {
          await api.del(`/cards/${btn.dataset.id}`, { auth: 'user' });
          btn.closest('[data-card-id]').remove();
          Toast.show('Card removed', 'success');
        } catch (err) { Toast.show(err.message || 'Failed to remove card', 'danger'); }
      });
    });
  } catch (err) {
    document.getElementById('cards-list').innerHTML = `<div class="alert alert-danger small">${err.message}</div>`;
  }
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
async function renderStats() {
  const el = document.getElementById('tab-stats');
  el.innerHTML = `<h5 class="mb-3">My travel stats</h5><div id="stats-body"><div class="spinner-border text-primary spinner-border-sm"></div></div>`;
  try {
    const { tickets } = await api.get('/tickets/mine', { auth: 'user' });
    const active    = tickets.filter((t) => t.status !== 'cancelled');
    const cancelled = tickets.filter((t) => t.status === 'cancelled');
    const revenue   = active.reduce((s, t) => s + (t.flight_id?.price || 0), 0);

    const cityCounts = {};
    active.forEach((t) => {
      const city = t.flight_id?.to_city?.city_name;
      if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    document.getElementById('stats-body').innerHTML = `
      <div class="row g-3">
        <div class="col-6 col-md-3"><div class="ft-stat-card text-center"><div class="ft-stat-value text-primary">${tickets.length}</div><div class="ft-stat-label text-muted">Total trips</div></div></div>
        <div class="col-6 col-md-3"><div class="ft-stat-card text-center"><div class="ft-stat-value text-success">${active.length}</div><div class="ft-stat-label text-muted">Active</div></div></div>
        <div class="col-6 col-md-3"><div class="ft-stat-card text-center"><div class="ft-stat-value text-danger">${cancelled.length}</div><div class="ft-stat-label text-muted">Cancelled</div></div></div>
        <div class="col-6 col-md-3"><div class="ft-stat-card text-center"><div class="ft-stat-value text-warning" style="font-size:1.2rem">${fmtPrice(revenue)}</div><div class="ft-stat-label text-muted">Total spent</div></div></div>
      </div>
      <div class="card flight-card p-3 mt-3">
        <div class="small text-muted">Favourite destination</div>
        <div class="fw-semibold fs-5">${topCity === '—' ? 'No trips yet' : '✈ ' + topCity}</div>
      </div>`;
  } catch (err) {
    document.getElementById('stats-body').innerHTML = `<div class="alert alert-danger small">${err.message}</div>`;
  }
}
