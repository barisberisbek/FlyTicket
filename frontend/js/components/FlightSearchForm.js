import { Component } from './Component.js';

export class FlightSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cities: props.cities || [],
      tripType: 'oneway',
    };
  }
  setCities(cities) { this.setState({ cities }); }

  template() {
    const opts = this.state.cities.map((c) =>
      `<option value="${c._id}">${c.city_name}</option>`).join('');
    const isRound = this.state.tripType === 'round';

    // Pre-fill from URL params
    const params = new URLSearchParams(location.search);
    const preFrom = params.get('from') || '';
    const preTo   = params.get('to') || '';
    const preDate = params.get('date') || '';
    const preRet  = params.get('returnDate') || '';

    const fromOpts = this.state.cities.map((c) =>
      `<option value="${c._id}" ${c._id === preFrom ? 'selected' : ''}>${c.city_name}</option>`).join('');
    const toOpts = this.state.cities.map((c) =>
      `<option value="${c._id}" ${c._id === preTo ? 'selected' : ''}>${c.city_name}</option>`).join('');

    return `
    <form class="card flight-card p-3 p-md-4 mb-4" id="ft-search-form" novalidate>
      <div class="d-flex gap-2 mb-3">
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn ${!isRound ? 'btn-primary' : 'btn-outline-primary'}" data-trip="oneway">One Way</button>
          <button type="button" class="btn ${isRound ? 'btn-primary' : 'btn-outline-primary'}" data-trip="round">Round Trip</button>
        </div>
        <div class="ms-auto d-flex align-items-center gap-2">
          <label class="form-label mb-0 small">Passengers</label>
          <select class="form-select form-select-sm" id="passengers" style="width:70px">
            <option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <label for="from" class="form-label">From</label>
          <select class="form-select" id="from" required>
            <option value="">Select origin</option>${fromOpts}
          </select>
          <div class="invalid-feedback">Origin and destination must differ.</div>
        </div>
        <div class="col-12 col-md-4">
          <label for="to" class="form-label">To</label>
          <select class="form-select" id="to" required>
            <option value="">Select destination</option>${toOpts}
          </select>
          <div class="invalid-feedback">Origin and destination must differ.</div>
        </div>
        <div class="col-12 col-md-${isRound ? '2' : '3'}">
          <label for="date" class="form-label">Departure</label>
          <input type="date" class="form-control" id="date" value="${preDate}" />
        </div>
        ${isRound ? `
        <div class="col-12 col-md-2">
          <label for="return-date" class="form-label">Return</label>
          <input type="date" class="form-control" id="return-date" value="${preRet}" />
        </div>` : ''}
        <div class="col-12 col-md-1 d-grid align-self-end">
          <button class="btn btn-primary" type="submit">Search</button>
        </div>
      </div>
    </form>`;
  }

  bindEvents() {
    // Trip type toggle
    this.el.querySelectorAll('[data-trip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setState({ tripType: btn.dataset.trip });
      });
    });

    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const fromSel = this.el.querySelector('#from');
      const toSel   = this.el.querySelector('#to');
      const from    = fromSel.value;
      const to      = toSel.value;
      const date    = this.el.querySelector('#date').value;
      const returnDate = this.el.querySelector('#return-date')?.value || '';
      const passengers = Number(this.el.querySelector('#passengers')?.value || 1);

      if (from && to && from === to) {
        fromSel.classList.add('is-invalid');
        toSel.classList.add('is-invalid');
        return;
      }
      fromSel.classList.remove('is-invalid');
      toSel.classList.remove('is-invalid');

      this.props.onSearch?.({
        from, to, date, returnDate, passengers,
        tripType: this.state.tripType,
      });
    });
  }
}
