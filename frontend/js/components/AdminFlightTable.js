import { Component } from './Component.js';
import { fmtDateTime, fmtPrice } from '../utils/format.js';

export class AdminFlightTable extends Component {
  constructor(props) { super(props); this.state = { flights: props.flights || [] }; }
  setFlights(flights) { this.setState({ flights }); }

  template() {
    if (!this.state.flights.length) {
      return `<div class="alert alert-info">No flights yet. Click "Add new flight" to create one.</div>`;
    }
    const rows = this.state.flights.map((f) => `
      <tr>
        <td><code>${f.flight_id}</code></td>
        <td>${f.from_city?.city_name || ''} &rarr; ${f.to_city?.city_name || ''}</td>
        <td>${fmtDateTime(f.departure_time)}</td>
        <td>${fmtDateTime(f.arrival_time)}</td>
        <td>${fmtPrice(f.price)}</td>
        <td>${f.seats_available}/${f.seats_total}</td>
        <td class="text-end">
          <a class="btn btn-sm btn-outline-primary" href="admin-flight-form.html?id=${f._id}">Edit</a>
          <button class="btn btn-sm btn-outline-danger" data-del="${f._id}">Delete</button>
        </td>
      </tr>`).join('');
    return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead><tr>
          <th>Flight</th><th>Route</th><th>Departure</th><th>Arrival</th><th>Price</th><th>Seats</th><th></th>
        </tr></thead>
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
