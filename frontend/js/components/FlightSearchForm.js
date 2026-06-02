import { Component } from './Component.js';

export class FlightSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = { cities: props.cities || [], tripType: 'oneway' };
  }
  setCities(cities) { this.setState({ cities }); }

  template() {
    const isRound = this.state.tripType === 'round';
    const params = new URLSearchParams(location.search);
    const preFrom = params.get('from') || '';
    const preTo   = params.get('to')   || '';
    const preDate = params.get('date') || '';
    const preRet  = params.get('returnDate') || '';

    const fromOpts = this.state.cities.map((c) =>
      `<option value="${c._id}" ${c._id === preFrom ? 'selected' : ''}>${c.city_name}</option>`).join('');
    const toOpts = this.state.cities.map((c) =>
      `<option value="${c._id}" ${c._id === preTo ? 'selected' : ''}>${c.city_name}</option>`).join('');

    return `
    <div class="ft-search-widget" id="ft-search-form-wrap">
      <form id="ft-search-form" novalidate>
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <button type="button" class="ft-trip-tab ${!isRound ? 'active' : ''}" data-trip="oneway">
            <i class="bi bi-arrow-right me-1"></i>One Way
          </button>
          <button type="button" class="ft-trip-tab ${isRound ? 'active' : ''}" data-trip="round">
            <i class="bi bi-arrow-left-right me-1"></i>Round Trip
          </button>
          <div class="ms-auto d-flex align-items-center gap-2">
            <span class="ft-search-label"><i class="bi bi-people me-1"></i>Pax</span>
            <select class="form-select form-select-sm" id="passengers" style="width:68px;font-size:.85rem;font-weight:600">
              <option>1</option><option>2</option><option>3</option><option>4</option>
            </select>
          </div>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-12 col-sm-6 col-lg-${isRound ? '3' : '4'}">
            <label class="ft-search-label"><i class="bi bi-geo-alt-fill me-1"></i>From</label>
            <select class="form-select" id="from" required>
              <option value="">Select origin</option>${fromOpts}
            </select>
            <div class="invalid-feedback">Must differ from destination.</div>
          </div>
          <div class="col-12 col-sm-6 col-lg-${isRound ? '3' : '4'}">
            <label class="ft-search-label"><i class="bi bi-geo-alt me-1"></i>To</label>
            <select class="form-select" id="to" required>
              <option value="">Select destination</option>${toOpts}
            </select>
            <div class="invalid-feedback">Must differ from origin.</div>
          </div>
          <div class="col-12 col-sm-6 col-lg-${isRound ? '2' : '3'}">
            <label class="ft-search-label"><i class="bi bi-calendar3 me-1"></i>Departure</label>
            <input type="date" class="form-control" id="date" value="${preDate}" />
          </div>
          ${isRound ? `
          <div class="col-12 col-sm-6 col-lg-2">
            <label class="ft-search-label"><i class="bi bi-calendar-check me-1"></i>Return</label>
            <input type="date" class="form-control" id="return-date" value="${preRet}" />
          </div>` : ''}
          <div class="col-12 col-sm-6 col-lg-1 d-grid">
            <button class="btn btn-primary" type="submit" style="height:38px">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </form>
    </div>`;
  }

  bindEvents() {
    this.el.querySelectorAll('[data-trip]').forEach((btn) => {
      btn.addEventListener('click', () => this.setState({ tripType: btn.dataset.trip }));
    });

    this.el.querySelector('#ft-search-form').addEventListener('submit', (e) => {
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
      this.props.onSearch?.({ from, to, date, returnDate, passengers, tripType: this.state.tripType });
    });
  }
}
