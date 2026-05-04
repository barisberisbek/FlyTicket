import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { AdminFlightForm } from '../components/AdminFlightForm.js';
import { Spinner } from '../components/Spinner.js';
import { Toast } from '../components/Toast.js';
import { requireAdmin } from '../utils/auth.js';

if (!requireAdmin()) throw new Error('redirecting');

mountChrome();
const host = appHost();
const id = new URLSearchParams(location.search).get('id');
const mode = id ? 'edit' : 'create';

const spin = new Spinner();
spin.mount(host);

(async () => {
  try {
    const [{ cities }, flightRes] = await Promise.all([
      api.get('/cities'),
      id ? api.get(`/flights/${id}`) : Promise.resolve({ flight: null }),
    ]);
    spin.unmount();

    let form;
    form = new AdminFlightForm({
      mode,
      cities,
      flight: flightRes.flight,
      onSubmit: async (data) => {
        form.setSaving(true);
        form.setError(null);
        try {
          if (mode === 'edit') {
            await api.put(`/flights/${id}`, data, { auth: 'admin' });
            Toast.show('Flight updated');
          } else {
            await api.post('/flights', data, { auth: 'admin' });
            Toast.show('Flight created');
          }
          window.location.href = 'admin-dashboard.html';
        } catch (e) {
          form.setError(e.message || 'Save failed');
        }
      },
    });
    form.mount(host);
  } catch (e) {
    spin.unmount();
    host.innerHTML = `<div class="alert alert-danger">${e.message || 'Load failed'}</div>`;
  }
})();
