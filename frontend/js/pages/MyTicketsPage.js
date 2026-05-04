import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { ETicket } from '../components/ETicket.js';
import { Toast } from '../components/Toast.js';
import { getCurrentUser } from '../utils/auth.js';
import { isEmail } from '../utils/validators.js';

mountChrome();
const host = appHost();
const user = getCurrentUser();

host.innerHTML = `
  <h3 class="mb-3">My Tickets</h3>
  <form class="card flight-card p-3 p-md-4 mb-3" id="ft-lookup" novalidate>
    <label class="form-label" for="mt-email">Look up by email</label>
    <div class="input-group">
      <input type="email" class="form-control" id="mt-email" value="${user?.email || ''}" required />
      <button type="submit" class="btn btn-primary">Search</button>
    </div>
  </form>
  <div id="ft-tickets"></div>
`;

const ticketsEl = document.getElementById('ft-tickets');

async function load(email) {
  ticketsEl.innerHTML = '<div class="text-center my-3"><div class="spinner-border text-primary"></div></div>';
  try {
    let tickets;
    if (user && email === user.email) {
      const r = await api.get('/tickets/mine', { auth: 'user' });
      tickets = r.tickets;
    } else {
      const r = await api.get(`/tickets/${encodeURIComponent(email)}`);
      tickets = r.tickets;
    }
    if (!tickets.length) {
      ticketsEl.innerHTML = '<div class="alert alert-info">No tickets found for that email.</div>';
      return;
    }
    ticketsEl.innerHTML = '';
    tickets.forEach((t) => {
      const wrap = document.createElement('div');
      wrap.className = 'mb-3';
      ticketsEl.appendChild(wrap);
      new ETicket({ ticket: t, flight: t.flight_id }).mount(wrap);
    });
  } catch (e) {
    ticketsEl.innerHTML = `<div class="alert alert-danger">${e.message || 'Failed to load'}</div>`;
  }
}

document.getElementById('ft-lookup').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('mt-email').value.trim();
  if (!isEmail(email)) { Toast.show('Enter a valid email', 'warning'); return; }
  load(email);
});

if (user?.email) load(user.email);
