import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { PaymentForm } from '../components/PaymentForm.js';
import { Toast } from '../components/Toast.js';
import { fmtPrice, fmtDateTime } from '../utils/format.js';

mountChrome();
const host = appHost();

const draftRaw = sessionStorage.getItem('ft_booking_draft');
if (!draftRaw) {
  host.innerHTML = `<div class="alert alert-warning">No booking in progress. <a href="index.html">Start over</a>.</div>`;
} else {
  const draft = JSON.parse(draftRaw);
  host.innerHTML = `
    <h3 class="mb-3">Complete your booking</h3>
    <div class="row g-3">
      <div class="col-12 col-lg-5">
        <div class="card flight-card p-3 p-md-4">
          <h5 class="mb-2">Order summary</h5>
          <div class="small text-muted mb-1">Flight ${draft.flight_summary?.flight_id}</div>
          <div class="fw-semibold">${draft.flight_summary?.from} &rarr; ${draft.flight_summary?.to}</div>
          <div class="text-muted small">${fmtDateTime(draft.flight_summary?.departure_time)}</div>
          <hr/>
          <div class="d-flex justify-content-between">
            <span>Passenger</span><strong>${draft.passenger_name} ${draft.passenger_surname}</strong>
          </div>
          <div class="d-flex justify-content-between">
            <span>Seat</span><strong>${draft.seat_number}</strong>
          </div>
          <div class="d-flex justify-content-between">
            <span>Email</span><strong>${draft.passenger_email}</strong>
          </div>
          <hr/>
          <div class="d-flex justify-content-between fs-5">
            <span>Total</span><strong class="text-primary">${fmtPrice(draft.amount)}</strong>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-7"><div id="ft-pf-host"></div></div>
    </div>
  `;

  const form = new PaymentForm({
    amountText: fmtPrice(draft.amount),
    onSubmit: async (cardData) => {
      try {
        await api.post('/payment/simulate', {
          amount: draft.amount,
          cardNumber: cardData.cardNumber,
          expiry: cardData.expiry,
          cvv: cardData.cvv,
        });
        const body = {
          flight_id: draft.flight_id,
          passenger_name: draft.passenger_name,
          passenger_surname: draft.passenger_surname,
          passenger_email: draft.passenger_email,
          seat_number: draft.seat_number,
        };
        const { ticket } = await api.post('/tickets', body, { auth: 'user' });
        sessionStorage.removeItem('ft_booking_draft');
        window.location.href = `booking-confirmation.html?ticket=${encodeURIComponent(ticket.ticket_id)}`;
      } catch (e) {
        Toast.show(e.message || 'Payment failed', 'danger');
        const btn = document.getElementById('pf-submit');
        if (btn) { btn.disabled = false; btn.textContent = 'Pay'; }
      }
    },
  });
  form.mount(document.getElementById('ft-pf-host'));
}
