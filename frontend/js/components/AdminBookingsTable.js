import { Component } from './Component.js';
import { fmtDateTime } from '../utils/format.js';

function paymentBadge(status) {
  if (status === 'paid') {
    return `<span class="ft-status-badge ft-status-scheduled">
      <i class="bi bi-check-circle-fill"></i> Paid
    </span>`;
  }
  return `<span class="ft-status-badge ft-status-delayed">
    <i class="bi bi-clock-fill"></i> ${status}
  </span>`;
}

export class AdminBookingsTable extends Component {
  constructor(props) { super(props); this.state = { tickets: props.tickets || [] }; }
  setTickets(tickets) { this.setState({ tickets }); }

  template() {
    if (!this.state.tickets.length) {
      return `
      <div class="card p-4 text-center">
        <div style="font-size:2.5rem;color:var(--ft-text-muted);opacity:.3;margin-bottom:.75rem">
          <i class="bi bi-ticket-perforated"></i>
        </div>
        <div class="fw-600" style="color:var(--ft-text-muted)">No bookings yet.</div>
      </div>`;
    }

    const rows = this.state.tickets.map((t) => {
      const f     = t.flight_id || {};
      const route = `${f.from_city?.city_name || '?'} → ${f.to_city?.city_name || '?'}`;
      return `
      <tr>
        <td><code>${t.ticket_id}</code></td>
        <td>
          <div class="fw-600">${t.passenger_name} ${t.passenger_surname}</div>
          <div class="small" style="color:var(--ft-text-muted)">${t.passenger_email}</div>
        </td>
        <td>${route}</td>
        <td>${fmtDateTime(f.departure_time)}</td>
        <td class="fw-600">${t.seat_number}</td>
        <td>${paymentBadge(t.payment_status)}</td>
        <td class="small" style="color:var(--ft-text-muted)">${fmtDateTime(t.createdAt)}</td>
      </tr>`;
    }).join('');

    return `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Passenger</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Seat</th>
            <th>Status</th>
            <th>Booked</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
}
