import { Component } from './Component.js';

export class FlightSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = { cities: props.cities || [] };
  }
  setCities(cities) { this.setState({ cities }); }

  template() {
    const opts = this.state.cities.map((c) =>
      `<option value="${c._id}">${c.city_name}</option>`).join('');
    return `
    <form class="card flight-card p-3 p-md-4 mb-4" id="ft-search-form" novalidate>
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <label for="from" class="form-label">From</label>
          <select class="form-select" id="from" required>
            <option value="">Select origin</option>${opts}
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label for="to" class="form-label">To</label>
          <select class="form-select" id="to" required>
            <option value="">Select destination</option>${opts}
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label for="date" class="form-label">Date</label>
          <input type="date" class="form-control" id="date" />
        </div>
        <div class="col-12 col-md-1 d-grid align-self-end">
          <button class="btn btn-primary" type="submit">Search</button>
        </div>
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = this.el.querySelector('#from').value;
      const to = this.el.querySelector('#to').value;
      const date = this.el.querySelector('#date').value;
      this.props.onSearch?.({ from, to, date });
    });
  }
}
