import { Component } from './Component.js';
import { fmtTime, fmtDate, fmtPrice, fmtDuration, cityCode } from '../utils/format.js';
import { flightStatusBadgeHtml } from './FlightStatusBadge.js';

export class FlightCard extends Component {
  template() {
    const f    = this.props.flight;
    const from = f.from_city?.city_name || '?';
    const to   = f.to_city?.city_name || '?';
    const sold = f.seats_available <= 0;
    const cancelled = f.status === 'cancelled';
    const bookable = !sold && !cancelled;

    const seats = sold ? `<span class="text-danger">Sold out</span>`
      : `<span>${f.seats_available} seats</span>`;

    return `
    <div class="ft-fc ft-animate-in">
      <div class="ft-fc-header">
        <i class="bi bi-airplane-fill"></i>
        <span>${f.flight_id}</span>
        <span class="mx-1" style="opacity:.3">·</span>
        <span>Economy</span>
        <span class="ms-auto">${flightStatusBadgeHtml(f.status)}</span>
      </div>
      <div class="ft-fc-body">
        <div class="ft-route">
          <div class="ft-city-block">
            <div class="ft-city-code">${cityCode(from)}</div>
            <div class="ft-city-time">${fmtTime(f.departure_time)}</div>
            <div class="ft-city-name">${from}</div>
          </div>
          <div class="ft-route-mid">
            <div class="ft-route-duration">${fmtDuration(f.departure_time, f.arrival_time)}</div>
            <div class="ft-route-line">
              <div class="ft-route-plane-icon"><i class="bi bi-airplane"></i></div>
            </div>
            <div style="font-size:.68rem;color:var(--ft-text-muted);font-weight:500">Direct</div>
          </div>
          <div class="ft-city-block text-end">
            <div class="ft-city-code">${cityCode(to)}</div>
            <div class="ft-city-time">${fmtTime(f.arrival_time)}</div>
            <div class="ft-city-name">${to}</div>
          </div>
        </div>
      </div>
      <div class="ft-fc-footer">
        <div class="ft-fc-meta">
          <span><i class="bi bi-calendar3"></i> ${fmtDate(f.departure_time)}</span>
          <span><i class="bi bi-people"></i> ${seats}</span>
        </div>
        <div class="ft-fc-price-block">
          <div class="ft-fc-price">${fmtPrice(f.price)}</div>
          <a class="btn btn-primary btn-sm px-3 ${bookable ? '' : 'disabled'}"
             href="${bookable ? `flight-detail.html?id=${f._id}` : '#'}"
             style="font-size:.82rem">
            ${cancelled ? 'Cancelled' : sold ? 'Sold out' : 'Book <i class="bi bi-arrow-right"></i>'}
          </a>
        </div>
      </div>
    </div>`;
  }
}
