import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { ConfirmationCard } from '../components/ConfirmationCard.js';
import { ETicket } from '../components/ETicket.js';
import { Spinner } from '../components/Spinner.js';
import { StepIndicator } from '../components/StepIndicator.js';
import { Toast } from '../components/Toast.js';
import { fmtDate } from '../utils/format.js';
import { getUserToken } from '../utils/auth.js';

mountChrome();
const host = appHost();
const params  = new URLSearchParams(location.search);
const id      = params.get('ticket');
const bookRef = params.get('ref') || '';

new StepIndicator({ currentStep: 4 }).mount(host);

if (!id) {
  host.innerHTML += `<div class="alert alert-warning">No ticket reference provided.</div>`;
} else {
  const spin = new Spinner();
  spin.mount(host);
  (async () => {
    try {
      const { ticket } = await api.get(`/tickets/id/${encodeURIComponent(id)}`);
      spin.unmount();

      // Round-trip return CTA?
      const returnDate = sessionStorage.getItem('ft_return_date');
      const tripType   = sessionStorage.getItem('ft_trip_type');
      const fromId     = ticket.flight_id?.to_city?._id;
      const toId       = ticket.flight_id?.from_city?._id;
      const fromName   = ticket.flight_id?.to_city?.city_name || '';
      const toName     = ticket.flight_id?.from_city?.city_name || '';

      const returnCta = (tripType === 'round' && returnDate && fromId && toId)
        ? `<div class="ft-return-cta no-print mt-3">
            <div class="ft-return-icon">↩️</div>
            <div class="flex-grow-1">
              <div class="fw-semibold">Book your return flight</div>
              <div class="small text-muted">${fromName} → ${toName} · ${fmtDate(returnDate)}</div>
            </div>
            <a href="index.html?from=${fromId}&to=${toId}&date=${returnDate}" class="btn btn-primary btn-sm">
              Search return
            </a>
          </div>`
        : '';

      // Save card prompt
      const newCardRaw = sessionStorage.getItem('ft_new_card_data');
      const saveCardHtml = (newCardRaw && getUserToken())
        ? `<div class="card flight-card p-3 mt-3 no-print" id="ft-save-card-section">
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="ft-save-card-cb">
              <label class="form-check-label fw-semibold" for="ft-save-card-cb">Save this card for future payments</label>
            </div>
            <div id="ft-save-card-form" style="display:none">
              <input class="form-control form-control-sm mb-2" id="ft-card-label" placeholder='Card label (e.g. "My Visa")' value="My Card" />
              <button class="btn btn-sm btn-outline-primary" id="ft-save-card-btn">Save card</button>
            </div>
          </div>`
        : '';

      host.innerHTML += `
        <div id="ft-conf"></div>
        <div id="ft-eticket" class="mt-3"></div>
        ${returnCta}
        ${saveCardHtml}
        <div class="d-flex gap-2 mt-3 no-print flex-wrap">
          <button class="btn btn-outline-primary" id="ft-print">Download / print e-ticket</button>
          <a class="btn btn-outline-secondary" href="my-tickets.html">View my tickets</a>
          <a class="btn btn-link ms-auto" href="index.html">Book another flight</a>
        </div>`;

      new ConfirmationCard({}).mount(document.getElementById('ft-conf'));
      new ETicket({ ticket, flight: ticket.flight_id }).mount(document.getElementById('ft-eticket'));

      document.getElementById('ft-print')?.addEventListener('click', () => window.print());

      // Save card logic
      const cb = document.getElementById('ft-save-card-cb');
      cb?.addEventListener('change', () => {
        document.getElementById('ft-save-card-form').style.display = cb.checked ? 'block' : 'none';
      });
      document.getElementById('ft-save-card-btn')?.addEventListener('click', async () => {
        const cardData = JSON.parse(newCardRaw);
        const label = document.getElementById('ft-card-label').value.trim() || 'My Card';
        try {
          await api.post('/cards', { ...cardData, label }, { auth: 'user' });
          Toast.show('Card saved!', 'success');
          document.getElementById('ft-save-card-section').remove();
          sessionStorage.removeItem('ft_new_card_data');
        } catch (e) { Toast.show(e.message || 'Failed to save card', 'danger'); }
      });

      // Cleanup round-trip session
      sessionStorage.removeItem('ft_return_date');
      sessionStorage.removeItem('ft_trip_type');

    } catch (e) {
      spin.unmount();
      host.innerHTML += `<div class="alert alert-danger">${e.message || 'Could not load ticket'}</div>`;
    }
  })();
}
