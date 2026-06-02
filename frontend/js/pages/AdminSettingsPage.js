import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();

host.innerHTML = `
  <div class="row justify-content-center">
    <div class="col-12 col-md-6">
      <h3 class="mb-4">⚙️ Admin Settings</h3>
      <div class="card flight-card p-4">
        <h5 class="mb-3">🔒 Change admin password</h5>
        <form id="ft-admin-pw-form" novalidate>
          <div class="mb-3">
            <label class="form-label">Current password</label>
            <input type="password" class="form-control" id="adm-cur" required />
          </div>
          <div class="mb-3">
            <label class="form-label">New password</label>
            <input type="password" class="form-control" id="adm-new" minlength="6" required />
            <div class="form-text">Minimum 6 characters.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Confirm new password</label>
            <input type="password" class="form-control" id="adm-conf" required />
          </div>
          <div id="adm-err" class="alert alert-danger" style="display:none"></div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" type="submit" id="adm-save">Change password</button>
            <a href="admin-dashboard.html" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
      <div class="card flight-card p-3 mt-3">
        <div class="small text-muted mb-1">Current admin</div>
        <div class="fw-semibold" id="adm-username">Loading...</div>
      </div>
    </div>
  </div>
`;

// Load current admin info
(async () => {
  try {
    const { flights } = await api.get('/flights', { auth: 'admin' });
    const adminData = JSON.parse(localStorage.getItem('flyticket_admin_data') || '{}');
    document.getElementById('adm-username').textContent = adminData.username || 'admin';
  } catch { /* ignore */ }
})();

document.getElementById('ft-admin-pw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('adm-err');
  errEl.style.display = 'none';
  const cur  = document.getElementById('adm-cur').value;
  const nw   = document.getElementById('adm-new').value;
  const conf = document.getElementById('adm-conf').value;

  if (nw.length < 6) {
    errEl.textContent = 'New password must be at least 6 characters.';
    errEl.style.display = 'block';
    return;
  }
  if (nw !== conf) {
    errEl.textContent = 'New passwords do not match.';
    errEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('adm-save');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

  try {
    await api.put('/auth/password', { currentPassword: cur, newPassword: nw }, { auth: 'admin' });
    Toast.show('Admin password changed successfully!', 'success');
    document.getElementById('ft-admin-pw-form').reset();
  } catch (err) {
    errEl.textContent = err.message || 'Failed to change password';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Change password';
  }
});
