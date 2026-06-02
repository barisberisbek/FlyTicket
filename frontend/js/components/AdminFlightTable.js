import { Component } from './Component.js';
import { fmtDateTime, fmtPrice } from '../utils/format.js';
import { flightStatusBadgeHtml } from './FlightStatusBadge.js';

export class AdminFlightTable extends Component {
  constructor(props) { super(props); this.state = { flights: props.flights || [] }; }
  setFlights(flights) { this.setState({ flights }); }

  template() {
    if (!this.state.flights.length) {
      return `
      <div class="card p-4 text-center">
        <div style="font-size:2.5rem;color:var(--ft-text-muted);opacity:.3;margin-bottom:.75rem">
          <i class="bi bi-airplane"></i>
        </div>
        <div class="fw-600" style="color:var(--ft-text-muted)">No flights yet.</div>
        <div class="small mt-1" style="color:var(--ft-text-muted)">Click <strong>Add new flight</strong> to get started.</div>
      </div>`;
    }

    const rows = this.state.flights.map((f) => `
      <tr>
        <td><code>${f.flight_id}</code></td>
        <td>
          <span class="fw-600">${f.from_city?.city_name || ''}</span>
          <i class="bi bi-arrow-right mx-1 text-muted" style="font-size:.75rem"></i>
          <span class="fw-600">${f.to_city?.city_name || ''}</span>
        </td>
        <td>${fmtDateTime(f.departure_time)}</td>
        <td>${fmtDateTime(f.arrival_time)}</td>
        <td class="fw-700" style="color:var(--ft-blue)">${fmtPrice(f.price)}</td>
        <td>
          <span class="fw-600">${f.seats_available}</span>
          <span class="text-muted">/${f.seats_total}</span>
        </td>
        <td>${flightStatusBadgeHtml(f.status)}</td>
        <td class="text-end">
          <a class="btn btn-sm btn-outline-primary me-1" href="admin-flight-form.html?id=${f._id}">
            <i class="bi bi-pencil"></i>
          </a>
          <button class="btn btn-sm btn-outline-danger" data-del="${f._id}" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`).join('');

    return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Price</th>
            <th>Seats</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  bindEvents() {
    this.el.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this flight? This cannot be undone.')) {
          this.props.onDelete?.(btn.dataset.del);
        }
      });
    });
  }
}
