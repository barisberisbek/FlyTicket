import { Component } from './Component.js';
import { fmtDate, fmtTime, fmtDuration, fmtPrice, cityCode } from '../utils/format.js';

function barcodeHtml(ticketId) {
  const seed = (ticketId || 'TK0000000000').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const heights = [20, 38, 28, 44, 22, 34, 26, 40, 24, 36, 30, 42];
  const widths  = [2, 3, 2, 4, 3, 2, 3, 2, 4, 2, 3, 2];
  let out = '';
  for (let i = 0; i < 30; i++) {
    const ch = seed[i % seed.length] || '0';
    const h = heights[(ch.charCodeAt(0) * 3 + i) % heights.length];
    const w = widths[i % widths.length];
    out += `<span style="width:${w}px;height:${h}px"></span>`;
  }
  return out;
}

export class ETicket extends Component {
  template() {
    const { ticket, flight } = this.props;
    const from = flight?.from_city?.city_name || '?';
    const to   = flight?.to_city?.city_name   || '?';
    const fromCode = cityCode(from);
    const toCode   = cityCode(to);
    const dep = flight?.departure_time;
    const arr = flight?.arrival_time;
    const isPaid = ticket.payment_status === 'paid';

    return `
    <div class="eticket-bp eticket">
      <!-- Header -->
      <div class="eticket-bp-header">
        <div class="eticket-bp-airline">
          <i class="bi bi-airplane-fill"></i>
          FlyTicket Airlines
        </div>
        <div class="d-flex flex-column align-items-end gap-1">
          <div class="eticket-bp-title">Boarding Pass</div>
          ${isPaid ? `<div class="eticket-bp-paid"><i class="bi bi-check-circle-fill"></i> Paid</div>` : ''}
        </div>
      </div>

      <!-- Body -->
      <div class="eticket-bp-body">
        <!-- Route -->
        <div class="eticket-route">
          <div class="eticket-city-block">
            <div class="eticket-code">${fromCode}</div>
            <div class="eticket-city-name">${from}</div>
          </div>
          <div class="eticket-route-mid">
            <div class="eticket-route-duration">${fmtDuration(dep, arr)}</div>
            <div class="eticket-route-line">
              <div class="eticket-plane-icon"><i class="bi bi-airplane-fill"></i></div>
            </div>
            <div class="eticket-route-times">
              <span>${fmtTime(dep)}</span>
              <span>${fmtTime(arr)}</span>
            </div>
          </div>
          <div class="eticket-city-block text-end">
            <div class="eticket-code">${toCode}</div>
            <div class="eticket-city-name">${to}</div>
          </div>
        </div>

        <!-- Details grid -->
        <div class="eticket-details">
          <div>
            <div class="eticket-field-label">Passenger</div>
            <div class="eticket-field-value">${ticket.passenger_name} ${ticket.passenger_surname}</div>
          </div>
          <div>
            <div class="eticket-field-label">Flight</div>
            <div class="eticket-field-value">${flight?.flight_id || ''}</div>
          </div>
          <div>
            <div class="eticket-field-label">Seat</div>
            <div class="eticket-field-value">${ticket.seat_number}</div>
          </div>
          <div>
            <div class="eticket-field-label">Date</div>
            <div class="eticket-field-value">${fmtDate(dep)}</div>
          </div>
          <div>
            <div class="eticket-field-label">Class</div>
            <div class="eticket-field-value">Economy</div>
          </div>
          <div>
            <div class="eticket-field-label">Price</div>
            <div class="eticket-field-value">${fmtPrice(flight?.price)}</div>
          </div>
        </div>
      </div>

      <!-- Perforation -->
      <div class="eticket-bp-perf">
        <div class="eticket-bp-perf-circle"></div>
        <div class="eticket-bp-perf-line"></div>
        <div class="eticket-bp-perf-circle"></div>
      </div>

      <!-- Stub -->
      <div class="eticket-bp-stub">
        <div class="eticket-stub-left">
          <div class="eticket-ticket-id">Ticket ID</div>
          <div class="eticket-ticket-id-val">${ticket.ticket_id}</div>
          <div class="small mt-1" style="color:var(--ft-text-muted);font-size:.72rem">
            <i class="bi bi-envelope me-1"></i>${ticket.passenger_email}
          </div>
        </div>
        <div class="ft-barcode">
          ${barcodeHtml(ticket.ticket_id)}
        </div>
      </div>
    </div>`;
  }
}
