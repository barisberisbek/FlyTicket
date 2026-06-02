import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminBookingsTable } from '../components/AdminBookingsTable.js';
import { Spinner } from '../components/Spinner.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();
host.innerHTML = `
  <h3 class="mb-3">All bookings <span class="badge bg-secondary ms-1" id="ft-bk-count"></span></h3>
  <div class="card flight-card p-3 mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-12 col-md-4">
        <label class="form-label small mb-1">Filter by email</label>
        <input class="form-control form-control-sm" id="bk-email" placeholder="passenger@email.com" />
      </div>
      <div class="col-12 col-md-4">
        <label class="form-label small mb-1">Filter by Flight ID</label>
        <input class="form-control form-control-sm" id="bk-flight" placeholder="FL..." />
      </div>
      <div class="col-12 col-md-3">
        <label class="form-label small mb-1">Filter by status</label>
        <select class="form-select form-select-sm" id="bk-status">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div class="col-12 col-md-1">
        <button class="btn btn-sm btn-outline-secondary w-100" id="bk-clear">Clear</button>
      </div>
    </div>
  </div>
  <div id="ft-bk-host"></div>
`;
const bkHost = document.getElementById('ft-bk-host');
const spin = new Spinner();
spin.mount(bkHost);

let allTickets = [];
let bkTable = null;

function applyFilter() {
  const email  = document.getElementById('bk-email').value.trim().toLowerCase();
  const flight = document.getElementById('bk-flight').value.trim().toLowerCase();
  const status = document.getElementById('bk-status').value;

  const filtered = allTickets.filter((t) => {
    if (email  && !t.passenger_email.includes(email)) return false;
    if (flight && !(t.flight_id?.flight_id || '').toLowerCase().includes(flight)) return false;
    if (status && t.status !== status) return false;
    return true;
  });

  bkTable.setTickets(filtered);
  document.getElementById('ft-bk-count').textContent = filtered.length;
}

['bk-email', 'bk-flight', 'bk-status'].forEach((id) => {
  document.getElementById(id).addEventListener('input', applyFilter);
  document.getElementById(id).addEventListener('change', applyFilter);
});
document.getElementById('bk-clear').addEventListener('click', () => {
  document.getElementById('bk-email').value = '';
  document.getElementById('bk-flight').value = '';
  document.getElementById('bk-status').value = '';
  applyFilter();
});

(async () => {
  try {
    const { tickets } = await api.get('/tickets', { auth: 'admin' });
    allTickets = tickets;
    spin.unmount();
    bkTable = new AdminBookingsTable({ tickets }).mount(bkHost) && new AdminBookingsTable({ tickets });
    // Re-mount properly
    bkHost.innerHTML = '';
    bkTable = new AdminBookingsTable({ tickets });
    bkTable.mount(bkHost);
    document.getElementById('ft-bk-count').textContent = tickets.length;
  } catch (e) {
    spin.unmount();
    Toast.show(e.message || 'Load failed', 'danger');
    bkHost.innerHTML = `<div class="alert alert-danger">${e.message || 'Load failed'}</div>`;
  }
})();
