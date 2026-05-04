import { Component } from './Component.js';
import { fmtDateTime, fmtPrice } from '../utils/format.js';

export class ETicket extends Component {
  template() {
    const { ticket, flight } = this.props;
    const from = flight?.from_city?.city_name || '?';
    const to = flight?.to_city?.city_name || '?';
    return `
    <div class="eticket">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div class="text-uppercase text-muted small">FlyTicket E-Ticket</div>
          <div class="fs-3 fw-bold">${from} <span class="route-arrow">&rarr;</span> ${to}</div>
        </div>
        <div class="text-end">
          <div class="small text-muted">Ticket ID</div>
          <div class="fw-semibold">${ticket.ticket_id}</div>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-6 col-md-3">
          <div class="small text-muted">Passenger</div>
          <div class="fw-semibold">${ticket.passenger_name} ${ticket.passenger_surname}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Seat</div>
          <div class="fw-semibold">${ticket.seat_number}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Departure</div>
          <div class="fw-semibold">${fmtDateTime(flight?.departure_time)}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Arrival</div>
          <div class="fw-semibold">${fmtDateTime(flight?.arrival_time)}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Flight</div>
          <div class="fw-semibold">${flight?.flight_id || ''}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Status</div>
          <div class="fw-semibold text-success">${ticket.payment_status}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Price</div>
          <div class="fw-semibold">${fmtPrice(flight?.price)}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="small text-muted">Email</div>
          <div class="fw-semibold">${ticket.passenger_email}</div>
        </div>
      </div>
    </div>`;
  }
}
