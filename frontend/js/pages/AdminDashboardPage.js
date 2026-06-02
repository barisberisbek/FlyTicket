import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminFlightTable } from '../components/AdminFlightTable.js';
import { StatCard } from '../components/StatCard.js';
import { Spinner } from '../components/Spinner.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';
import { fmtPrice } from '../utils/format.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();
host.innerHTML = `
  <div class="row g-3 mb-4" id="ft-stats-row"></div>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="mb-0">Flights <span class="badge bg-secondary ms-1" id="ft-flight-count"></span></h3>
    <a href="admin-flight-form.html" class="btn btn-primary">+ Add new flight</a>
  </div>
  <div id="ft-table-host"></div>
`;

const statsRow   = document.getElementById('ft-stats-row');
const tableHost  = document.getElementById('ft-table-host');
const spin = new Spinner();
spin.mount(tableHost);

// Load stats
(async () => {
  try {
    const s = await api.get('/admin/stats', { auth: 'admin' });
    [
      { icon: '✈️', label: 'Total Flights', value: s.totalFlights, sub: `${s.upcomingFlights} upcoming`, color: 'text-primary' },
      { icon: '🎫', label: 'Total Bookings', value: s.totalBookings, sub: `${s.bookingsToday} today`, color: 'text-success' },
      { icon: '💰', label: 'Total Revenue', value: fmtPrice(s.totalRevenue), sub: 'active tickets', color: 'text-warning' },
      { icon: '📊', label: 'Avg Occupancy', value: `${s.avgOccupancy}%`, sub: `${s.cancelledFlights} cancelled`, color: 'text-danger' },
    ].forEach(({ icon, label, value, sub, color }) => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-3';
      statsRow.appendChild(col);
      new StatCard({ icon, label, value, sub, colorClass: color }).mount(col);
    });
  } catch { /* stats non-critical */ }
})();

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
