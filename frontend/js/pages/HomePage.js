import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { FlightSearchForm } from '../components/FlightSearchForm.js';
import { FlightList } from '../components/FlightList.js';
import { Toast } from '../components/Toast.js';

mountChrome();
const host = appHost();
host.innerHTML = `
  <div class="ft-hero">
    <div class="container">
      <div class="ft-hero-content">
        <span class="ft-hero-icon">✈</span>
        <h1>Find Your Perfect Flight</h1>
        <p class="ft-hero-sub">Domestic flights across all 81 provinces of Türkiye</p>
      </div>
      <div class="ft-search-hero">
        <div id="ft-search-host"></div>
      </div>
    </div>
  </div>
  <div class="container ft-results-section">
    <div id="ft-results"></div>
  </div>
`;

const list = new FlightList({ flights: [] });
list.mount(document.getElementById('ft-results'));

const search = new FlightSearchForm({
  cities: [],
  onSearch: async ({ from, to, date, returnDate, passengers, tripType }) => {
    sessionStorage.setItem('ft_passengers', String(passengers || 1));
    if (tripType === 'round' && returnDate) {
      sessionStorage.setItem('ft_trip_type', 'round');
      sessionStorage.setItem('ft_return_date', returnDate);
    } else {
      sessionStorage.removeItem('ft_trip_type');
      sessionStorage.removeItem('ft_return_date');
    }

    list.setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to)   params.set('to', to);
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

(async () => {
  try {
    const { cities } = await api.get('/cities');
    search.setCities(cities);

    const urlParams = new URLSearchParams(location.search);
    const hasPreFill = urlParams.get('from') || urlParams.get('to') || urlParams.get('date');

    if (hasPreFill) {
      const from = urlParams.get('from') || '';
      const to   = urlParams.get('to')   || '';
      const date = urlParams.get('date') || '';
      list.setLoading(true);
      const qp = new URLSearchParams();
      if (from) qp.set('from', from);
      if (to)   qp.set('to', to);
      if (date) qp.set('date', date);
      const { flights } = await api.get(`/flights?${qp.toString()}`);
      list.setFlights(flights);
    } else {
      const { flights } = await api.get('/flights');
      list.setFlights(flights);
    }
  } catch (e) {
    Toast.show(e.message || 'Failed to load data', 'danger');
  }
})();
