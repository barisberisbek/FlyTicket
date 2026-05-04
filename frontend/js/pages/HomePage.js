import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { FlightSearchForm } from '../components/FlightSearchForm.js';
import { FlightList } from '../components/FlightList.js';
import { Toast } from '../components/Toast.js';

mountChrome();

const host = appHost();
host.innerHTML = `
  <section class="text-center mb-4">
    <h1 class="display-6 fw-bold">Find your next flight</h1>
    <p class="text-muted">Domestic flights across all 81 provinces of Türkiye.</p>
  </section>
  <div id="ft-search-host"></div>
  <div id="ft-results"></div>
`;

const search = new FlightSearchForm({
  cities: [],
  onSearch: async ({ from, to, date }) => {
    list.setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (date) params.set('date', date);
      const { flights } = await api.get(`/flights?${params.toString()}`);
      list.setFlights(flights);
    } catch (e) {
      list.setFlights([]);
      Toast.show(e.message || 'Search failed', 'danger');
    }
  },
});
search.mount(document.getElementById('ft-search-host'));

const list = new FlightList({ flights: [] });
list.mount(document.getElementById('ft-results'));

(async () => {
  try {
    const { cities } = await api.get('/cities');
    search.setCities(cities);
    const { flights } = await api.get('/flights');
    list.setFlights(flights);
  } catch (e) {
    Toast.show(e.message || 'Failed to load data', 'danger');
  }
})();
