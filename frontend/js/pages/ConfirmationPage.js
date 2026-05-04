import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { ConfirmationCard } from '../components/ConfirmationCard.js';
import { ETicket } from '../components/ETicket.js';
import { Spinner } from '../components/Spinner.js';

mountChrome();
const host = appHost();
const id = new URLSearchParams(location.search).get('ticket');

if (!id) {
  host.innerHTML = `<div class="alert alert-warning">No ticket reference provided.</div>`;
} else {
  const spin = new Spinner();
  spin.mount(host);
  (async () => {
    try {
      const { ticket } = await api.get(`/tickets/id/${encodeURIComponent(id)}`);
      spin.unmount();
      host.innerHTML = `
        <div id="ft-conf"></div>
        <div id="ft-eticket"></div>
        <div class="d-flex gap-2 mt-3 no-print">
          <button class="btn btn-outline-primary" id="ft-print">Download / print e-ticket</button>
          <a class="btn btn-outline-secondary" href="my-tickets.html">View my tickets</a>
          <a class="btn btn-link ms-auto" href="index.html">Book another flight</a>
        </div>`;
      new ConfirmationCard({}).mount(document.getElementById('ft-conf'));
      new ETicket({ ticket, flight: ticket.flight_id }).mount(document.getElementById('ft-eticket'));
      document.getElementById('ft-print').addEventListener('click', () => window.print());
    } catch (e) {
      spin.unmount();
      host.innerHTML = `<div class="alert alert-danger">${e.message || 'Could not load ticket'}</div>`;
    }
  })();
}
