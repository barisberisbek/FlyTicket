import { Component } from './Component.js';
import { toLocalInput } from '../utils/format.js';

export class AdminFlightForm extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, saving: false };
  }
  setError(msg) { this.setState({ error: msg, saving: false }); }
  setSaving(v) { this.setState({ saving: v }); }

  template() {
    const cities = this.props.cities || [];
    const f = this.props.flight || {};
    const opts = (selectedId) => cities.map((c) =>
      `<option value="${c._id}" ${String(c._id) === String(selectedId) ? 'selected' : ''}>${c.city_name}</option>`).join('');
    const fromId = f.from_city?._id || f.from_city;
    const toId = f.to_city?._id || f.to_city;
    return `
    <form class="card flight-card p-3 p-md-4" id="ft-admin-flight-form" novalidate>
      <h5 class="mb-3">${this.props.mode === 'edit' ? 'Edit flight' : 'New flight'}</h5>
      ${this.state.error ? `<div class="alert alert-danger">${this.state.error}</div>` : ''}
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-from">From</label>
          <select class="form-select" id="aff-from" required>
            <option value="">Select origin</option>${opts(fromId)}
          </select>
          <div class="invalid-feedback">Origin city is required.</div>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-to">To</label>
          <select class="form-select" id="aff-to" required>
            <option value="">Select destination</option>${opts(toId)}
          </select>
          <div class="invalid-feedback">Destination required and must differ from origin.</div>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-dep">Departure</label>
          <input type="datetime-local" class="form-control" id="aff-dep" value="${toLocalInput(f.departure_time)}" required />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-arr">Arrival</label>
          <input type="datetime-local" class="form-control" id="aff-arr" value="${toLocalInput(f.arrival_time)}" required />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-price">Price (TRY)</label>
          <input type="number" min="0" step="0.01" class="form-control" id="aff-price" value="${f.price ?? ''}" required />
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="aff-seats">Total seats</label>
          <input type="number" min="1" step="1" class="form-control" id="aff-seats" value="${f.seats_total ?? 60}" required />
        </div>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button type="submit" class="btn btn-primary" ${this.state.saving ? 'disabled' : ''}>
          ${this.state.saving ? 'Saving...' : 'Save'}
        </button>
        <a href="admin-dashboard.html" class="btn btn-outline-secondary">Cancel</a>
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const fromSel = this.el.querySelector('#aff-from');
      const toSel = this.el.querySelector('#aff-to');
      const fromVal = fromSel.value;
      const toVal = toSel.value;
      let ok = true;
      if (!fromVal) { fromSel.classList.add('is-invalid'); ok = false; }
      else fromSel.classList.remove('is-invalid');
      if (!toVal) { toSel.classList.add('is-invalid'); ok = false; }
      else if (fromVal && fromVal === toVal) { toSel.classList.add('is-invalid'); ok = false; }
      else toSel.classList.remove('is-invalid');
      if (!ok) return;
      const data = {
        from_city: fromVal,
        to_city: toVal,
        departure_time: new Date(this.el.querySelector('#aff-dep').value).toISOString(),
        arrival_time: new Date(this.el.querySelector('#aff-arr').value).toISOString(),
        price: Number(this.el.querySelector('#aff-price').value),
        seats_total: Number(this.el.querySelector('#aff-seats').value),
      };
      this.props.onSubmit?.(data);
    });
  }
}
