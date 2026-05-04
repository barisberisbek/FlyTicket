import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminBookingsTable } from '../components/AdminBookingsTable.js';
import { Spinner } from '../components/Spinner.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();
host.innerHTML = `<h3 class="mb-3">All bookings</h3><div id="ft-bk-host"></div>`;
const bkHost = document.getElementById('ft-bk-host');
const spin = new Spinner();
spin.mount(bkHost);

(async () => {
  try {
    const { tickets } = await api.get('/tickets', { auth: 'admin' });
    spin.unmount();
    new AdminBookingsTable({ tickets }).mount(bkHost);
  } catch (e) {
    spin.unmount();
    Toast.show(e.message || 'Load failed', 'danger');
    bkHost.innerHTML = `<div class="alert alert-danger">${e.message || 'Load failed'}</div>`;
  }
})();
