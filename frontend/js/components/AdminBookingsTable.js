import { Component } from './Component.js';
import { fmtDateTime } from '../utils/format.js';

export class AdminBookingsTable extends Component {
  constructor(props) { super(props); this.state = { tickets: props.tickets || [] }; }
  setTickets(tickets) { this.setState({ tickets }); }

  template() {
    if (!this.state.tickets.length) {
      return `<div class="alert alert-info">No bookings yet.</div>`;
    }
    const rows = this.state.tickets.map((t) => {
      const f = t.flight_id || {};
      const route = `${f.from_city?.city_name || '?'} → ${f.to_city?.city_name || '?'}`;
      return `
      <tr>
        <td><code>${t.ticket_id}</code></td>
        <td>${t.passenger_name} ${t.passenger_surname}</td>
        <td>${t.passenger_email}</td>
        <td>${route}</td>
        <td>${fmtDateTime(f.departure_time)}</td>
        <td>${t.seat_number}</td>
        <td><span class="badge bg-${t.payment_status === 'paid' ? 'success' : 'warning'}">${t.payment_status}</span></td>
        <td>${fmtDateTime(t.createdAt)}</td>
      </tr>`;
    }).join('');
    return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead><tr>
          <th>Ticket</th><th>Passenger</th><th>Email</th><th>Route</th>
          <th>Departure</th><th>Seat</th><th>Status</th><th>Booked</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
}
