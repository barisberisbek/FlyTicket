import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { PaymentForm } from '../components/PaymentForm.js';
import { SavedCardPicker } from '../components/SavedCardPicker.js';
import { StepIndicator } from '../components/StepIndicator.js';
import { Toast } from '../components/Toast.js';
import { fmtPrice, fmtDateTime } from '../utils/format.js';
import { getUserToken } from '../utils/auth.js';

mountChrome();
const host = appHost();

new StepIndicator({ currentStep: 3 }).mount(host);

const draftRaw = sessionStorage.getItem('ft_booking_draft');
if (!draftRaw) {
  host.innerHTML += `<div class="alert alert-warning">No booking in progress. <a href="index.html">Start over</a>.</div>`;
} else {
  const draft = JSON.parse(draftRaw);
  const seatsDisplay = Array.isArray(draft.seats) ? draft.seats.join(', ') : (draft.seat_number || '—');
  const passengerCount = draft.passengerCount || 1;
  const priceEach = draft.amount / passengerCount;

  host.innerHTML += `
    <a href="flight-detail.html?id=${draft.flight_id}" class="btn btn-link ps-0 mb-2">&larr; Back to flight</a>
    <h3 class="mb-3">Complete your booking</h3>
    <div class="row g-3">
      <div class="col-12 col-lg-5">
        <div class="card flight-card p-3 p-md-4">
          <h5 class="mb-2">Order summary</h5>
          <div class="small text-muted mb-1">Flight ${draft.flight_summary?.flight_id}</div>
          <div class="fw-semibold">${draft.flight_summary?.from} &rarr; ${draft.flight_summary?.to}</div>
          <div class="text-muted small">${fmtDateTime(draft.flight_summary?.departure_time)}</div>
          <hr/>
          <div class="d-flex justify-content-between"><span>Passenger</span><strong>${draft.passenger_name} ${draft.passenger_surname}</strong></div>
          <div class="d-flex justify-content-between"><span>Seat${passengerCount > 1 ? 's' : ''}</span><strong>${seatsDisplay}</strong></div>
          <div class="d-flex justify-content-between"><span>Email</span><strong>${draft.passenger_email}</strong></div>
          ${passengerCount > 1 ? `<div class="d-flex justify-content-between text-muted small"><span>${passengerCount} × ${fmtPrice(priceEach)}</span><span>${fmtPrice(draft.amount)}</span></div>` : ''}
          <hr/>
          <div class="d-flex justify-content-between fs-5">
            <span>Total</span><strong class="text-primary">${fmtPrice(draft.amount)}</strong>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-7">
        <div id="ft-card-picker-host"></div>
        <div id="ft-pf-host"></div>
      </div>
    </div>
  `;

  let savedCards = [];
  let selectedCard = null; // null = use new card form

  async function initCards() {
    if (!getUserToken()) return showPaymentForm(true);
    try {
      const { cards } = await api.get('/cards', { auth: 'user' });
      savedCards = cards || [];
    } catch { savedCards = []; }

    if (savedCards.length > 0) {
      const picker = new SavedCardPicker({
        cards: savedCards,
        onSelect: (card) => {
          selectedCard = card;
          const pfHost = document.getElementById('ft-pf-host');
          if (card) {
            pfHost.innerHTML = `
              <div class="card flight-card p-3 mt-2">
                <p class="mb-2 small text-muted">Paying with saved card</p>
                <div class="fw-semibold">💳 ${card.label} — •••• ${card.last_four}</div>
                <div class="small text-muted">Exp ${card.expiry}</div>
                <div class="d-grid mt-3">
                  <button class="btn btn-success" id="ft-quick-pay">Pay ${fmtPrice(draft.amount)}</button>
                </div>
              </div>`;
            document.getElementById('ft-quick-pay').addEventListener('click', () => doBooking('4111111111111111', card.expiry, '123'));
          } else {
            showPaymentForm(false);
          }
        },
      });
      picker.mount(document.getElementById('ft-card-picker-host'));
    }
    showPaymentForm(savedCards.length === 0);
  }

  function showPaymentForm(show) {
    const pfHost = document.getElementById('ft-pf-host');
    if (!show) { pfHost.innerHTML = ''; return; }
    const form = new PaymentForm({
      amountText: fmtPrice(draft.amount),
      onSubmit: async (cardData) => {
        await doBooking(cardData.cardNumber, cardData.expiry, cardData.cvv, cardData);
      },
    });
    form.mount(pfHost);
  }

  async function doBooking(cardNumber, expiry, cvv, cardData) {
    try {
      await api.post('/payment/simulate', { amount: draft.amount, cardNumber: cardNumber.replace(/\s+/g, ''), expiry, cvv });

      const body = {
        flight_id: draft.flight_id,
        passenger_name: draft.passenger_name,
        passenger_surname: draft.passenger_surname,
        passenger_email: draft.passenger_email,
        seats: draft.seats || [draft.seat_number],
        seat_number: draft.seat_number,
      };
      const result = await api.post('/tickets', body, { auth: 'user' });

      // Store card data for save-card prompt on confirmation page
      if (cardData && getUserToken()) {
        sessionStorage.setItem('ft_new_card_data', JSON.stringify({
          lastFour: cardData.cardNumber.replace(/\s+/g, '').slice(-4),
          firstDigit: cardData.cardNumber.replace(/\s+/g, '')[0],
          expiry: cardData.expiry,
        }));
      } else {
        sessionStorage.removeItem('ft_new_card_data');
      }

      sessionStorage.removeItem('ft_booking_draft');
      const firstTicketId = result.ticket?.ticket_id || result.tickets?.[0]?.ticket_id;
      window.location.href = `booking-confirmation.html?ticket=${encodeURIComponent(firstTicketId)}&ref=${result.booking_ref || ''}`;
    } catch (e) {
      Toast.show(e.message || 'Payment failed', 'danger');
      const btn = document.getElementById('pf-submit') || document.getElementById('ft-quick-pay');
      if (btn) { btn.disabled = false; btn.textContent = 'Pay'; }
    }
  }

  initCards();
}
