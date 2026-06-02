import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { SeatMap } from '../components/SeatMap.js';
import { BookingForm } from '../components/BookingForm.js';
import { Toast } from '../components/Toast.js';
import { Spinner } from '../components/Spinner.js';
import { getCurrentUser } from '../utils/auth.js';
import { fmtDateTime, fmtPrice, fmtDuration } from '../utils/format.js';

mountChrome();
const host = appHost();
const id = new URLSearchParams(location.search).get('id');
if (!id) { host.innerHTML = '<div class="alert alert-danger">Missing flight id.</div>'; }

const spin = new Spinner();
spin.mount(host);

(async () => {
  try {
    const { flight } = await api.get(`/flights/${id}`);
    spin.unmount();
    renderPage(flight);
  } catch (e) {
    spin.unmount();
    host.innerHTML = `<div class="alert alert-danger">${e.message || 'Failed to load flight'}</div>`;
  }
})();

function renderPage(flight) {
  const from = flight.from_city?.city_name || '?';
  const to = flight.to_city?.city_name || '?';
  host.innerHTML = `
    <a href="index.html" class="btn btn-link ps-0 mb-2">&larr; Back to search</a>
    <div class="card flight-card p-3 p-md-4 mb-3">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div>
          <h3 class="mb-1">${from} <span class="route-arrow">&rarr;</span> ${to}</h3>
          <div class="text-muted">
            ${fmtDateTime(flight.departure_time)} → ${fmtDateTime(flight.arrival_time)}
            <span class="mx-1">•</span>${fmtDuration(flight.departure_time, flight.arrival_time)}
            <span class="mx-1">•</span>Flight ${flight.flight_id}
          </div>
        </div>
        <div class="text-end">
          <div class="fs-3 fw-bold text-primary">${fmtPrice(flight.price)}</div>
          <div class="small text-muted">${flight.seats_available} seats left</div>
        </div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-12 col-lg-7"><div id="ft-seatmap-host" class="card flight-card p-3 p-md-4"></div></div>
      <div class="col-12 col-lg-5"><div id="ft-booking-host"></div></div>
    </div>
  `;

  const seatMap = new SeatMap({
    seatsTotal: flight.seats_total,
    bookedSeats: flight.booked_seats,
  });
  seatMap.mount(document.getElementById('ft-seatmap-host'));

  if (flight.seats_available === 0) {
    document.getElementById('ft-booking-host').innerHTML =
      `<div class="alert alert-danger mt-2"><strong>Sold out.</strong> This flight has no available seats.</div>`;
    return;
  }

  const bookingForm = new BookingForm({
    user: getCurrentUser() || undefined,
    onSubmit: (passenger) => {
      const seat = seatMap.getSelected();
      if (!seat) {
        Toast.show('Please select a seat first.', 'warning');
        return;
      }
      const draft = {
        flight_id: flight._id,
        seat_number: seat,
        ...passenger,
        amount: flight.price,
        flight_summary: { from, to, departure_time: flight.departure_time, flight_id: flight.flight_id },
      };
      sessionStorage.setItem('ft_booking_draft', JSON.stringify(draft));
      window.location.href = 'payment.html';
    },
  });
  bookingForm.mount(document.getElementById('ft-booking-host'));
}
