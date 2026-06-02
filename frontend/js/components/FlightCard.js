import { Component } from './Component.js';
import { fmtDateTime, fmtPrice, fmtDuration } from '../utils/format.js';
import { flightStatusBadgeHtml } from './FlightStatusBadge.js';

export class FlightCard extends Component {
  template() {
    const f    = this.props.flight;
    const from = f.from_city?.city_name || '?';
    const to   = f.to_city?.city_name || '?';
    const sold = f.seats_available <= 0;
    const cancelled = f.status === 'cancelled';

    return `
    <div class="flight-card p-3 mb-3">
      <div class="row align-items-center g-3">
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2 fs-5 fw-semibold flex-wrap">
            <span>${from}</span>
            <span class="route-arrow" aria-hidden="true">&rarr;</span>
            <span>${to}</span>
            <span class="ms-1">${flightStatusBadgeHtml(f.status)}</span>
          </div>
          <div class="text-muted small mt-1">
            <span>${fmtDateTime(f.departure_time)}</span>
            <span class="mx-2">•</span>
            <span>${fmtDuration(f.departure_time, f.arrival_time)}</span>
            <span class="mx-2">•</span>
            <span>${f.seats_available}/${f.seats_total} seats</span>
          </div>
          <div class="text-muted small">Flight ${f.flight_id}</div>
        </div>
        <div class="col-6 col-md-3 text-md-end">
          <div class="fs-4 fw-bold text-primary">${fmtPrice(f.price)}</div>
        </div>
        <div class="col-6 col-md-3 d-grid">
          <a class="btn ${sold || cancelled ? 'btn-secondary disabled' : 'btn-primary'}"
             href="${!sold && !cancelled ? `flight-detail.html?id=${f._id}` : '#'}">
            ${cancelled ? 'Cancelled' : sold ? 'Sold out' : 'Book'}
          </a>
        </div>
      </div>
    </div>`;
  }
}
