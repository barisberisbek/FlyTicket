import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminFlightTable } from '../components/AdminFlightTable.js';
import { Spinner } from '../components/Spinner.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();
host.innerHTML = `
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Flights <span class="badge bg-secondary ms-1" id="ft-flight-count"></span></h3>
    <a href="admin-flight-form.html" class="btn btn-primary">+ Add new flight</a>
  </div>
  <div id="ft-table-host"></div>
`;
const tableHost = document.getElementById('ft-table-host');
const spin = new Spinner();
spin.mount(tableHost);

const table = new AdminFlightTable({
  flights: [],
  onDelete: async (id) => {
    try {
      await api.del(`/flights/${id}`, { auth: 'admin' });
      Toast.show('Flight deleted');
      load();
    } catch (e) {
      Toast.show(e.message || 'Delete failed', 'danger');
    }
  },
});

async function load() {
  try {
    const { flights } = await api.get('/flights');
    spin.unmount();
    if (!table.el) table.mount(tableHost);
    table.setFlights(flights);
    const badge = document.getElementById('ft-flight-count');
    if (badge) badge.textContent = flights.length;
  } catch (e) {
    Toast.show(e.message || 'Load failed', 'danger');
  }
}
load();
