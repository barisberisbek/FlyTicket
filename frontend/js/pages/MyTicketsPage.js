import { mountChrome, appHost } from '../app.js';
import { api } from '../api/ApiClient.js';
import { ETicket } from '../components/ETicket.js';
import { Toast } from '../components/Toast.js';
import { getCurrentUser } from '../utils/auth.js';
import { isEmail } from '../utils/validators.js';
import { fmtPrice } from '../utils/format.js';
import { calcRefund } from '../utils/cancellationPolicy.js';

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
  <div id="ft-tab-bar" class="mb-3" style="display:none">
    <div class="ft-profile-tabs">
      <button class="ft-profile-tab active" data-tab="active">Active</button>
      <button class="ft-profile-tab" data-tab="cancelled">Cancelled</button>
    </div>
  </div>
  <div id="ft-tickets"></div>
  <!-- Cancel Modal -->
  <div class="modal fade" id="ft-cancel-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cancel Ticket</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="ft-cancel-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Keep ticket</button>
          <button class="btn btn-danger" id="ft-cancel-confirm">Yes, cancel ticket</button>
        </div>
      </div>
    </div>
  </div>
`;

const ticketsEl = document.getElementById('ft-tickets');
const tabBar    = document.getElementById('ft-tab-bar');
let allTickets  = [];
let activeTab   = 'active';
let cancelModal = null;
let pendingCancelId = null;

// Tab events
document.querySelectorAll('.ft-profile-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ft-profile-tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    renderTickets();
  });
});

// Cancel confirm
document.getElementById('ft-cancel-confirm').addEventListener('click', async () => {
  if (!pendingCancelId) return;
  const btn = document.getElementById('ft-cancel-confirm');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Cancelling...';
  try {
    const result = await api.patch(`/tickets/${pendingCancelId}/cancel`, {}, { auth: 'user' });
    cancelModal?.hide();
    const msg = result.refundAmount > 0
      ? `Ticket cancelled. Refund: ${fmtPrice(result.refundAmount)} (${Math.round(result.refundRate * 100)}%)`
      : 'Ticket cancelled. No refund applicable.';
    Toast.show(msg, 'success');
    // Update local state
    const t = allTickets.find((t) => t.ticket_id === pendingCancelId);
    if (t) { t.status = 'cancelled'; t.cancelled_at = new Date().toISOString(); }
    renderTickets();
  } catch (e) {
    Toast.show(e.message || 'Cancellation failed', 'danger');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Yes, cancel ticket';
    pendingCancelId = null;
  }
});

function renderTickets() {
  const filtered = activeTab === 'active'
    ? allTickets.filter((t) => t.status !== 'cancelled')
    : allTickets.filter((t) => t.status === 'cancelled');

  if (!filtered.length) {
    ticketsEl.innerHTML = `<div class="alert alert-info">No ${activeTab} tickets.</div>`;
    return;
  }

  ticketsEl.innerHTML = '';
  // Group by booking_ref
  const groups = {};
  filtered.forEach((t) => {
    const key = t.booking_ref || t.ticket_id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  Object.values(groups).forEach((group) => {
    const wrap = document.createElement('div');
    wrap.className = 'mb-3 ft-animate-in';
    ticketsEl.appendChild(wrap);

    if (group.length > 1) {
      const badge = group[0].booking_ref ? 'Group Booking' : 'Multi-seat';
      wrap.innerHTML = `<div class="small text-muted mb-1">📦 ${badge} · ${group.length} tickets · Ref: ${group[0].booking_ref || ''}</div>`;
    }

    group.forEach((ticket) => {
      const flight = ticket.flight_id || {};
      const dep = flight.departure_time;
      const price = flight.price || 0;
      const canCancel = ticket.status === 'active' && dep && new Date(dep) > new Date();
      const policy = dep ? calcRefund(dep, price) : null;
      const refundNote = policy && !policy.blocked
        ? `<small class="text-muted">${policy.rate === 1 ? 'Full refund' : policy.rate === 0 ? 'No refund' : `${Math.round(policy.rate*100)}% refund`} if cancelled</small>`
        : '';

      const ticketWrap = document.createElement('div');
      ticketWrap.className = ticket.status === 'cancelled' ? 'mb-2 eticket-cancelled' : 'mb-2';
      wrap.appendChild(ticketWrap);
      new ETicket({ ticket, flight }).mount(ticketWrap);

      if (canCancel) {
        const cancelDiv = document.createElement('div');
        cancelDiv.className = 'd-flex align-items-center gap-2 mt-1 mb-3';
        cancelDiv.innerHTML = `${refundNote}<button class="btn btn-sm btn-outline-danger ms-auto" data-cancel="${ticket.ticket_id}">Cancel ticket</button>`;
        wrap.appendChild(cancelDiv);
        cancelDiv.querySelector('[data-cancel]').addEventListener('click', () => showCancelModal(ticket));
      } else if (ticket.status === 'cancelled') {
        const note = document.createElement('div');
        note.className = 'small text-danger mb-3';
        note.textContent = `Cancelled${ticket.cancelled_at ? ` on ${new Date(ticket.cancelled_at).toLocaleDateString('en-GB')}` : ''}`;
        wrap.appendChild(note);
      }
    });
  });
}

function showCancelModal(ticket) {
  const flight = ticket.flight_id || {};
  const dep = flight.departure_time;
  const price = flight.price || 0;
  const policy = dep ? calcRefund(dep, price) : { rate: 0, refundAmount: 0, blocked: true, reason: 'Unknown.' };

  let refundHtml;
  if (policy.blocked) {
    refundHtml = `<div class="alert alert-danger small">${policy.reason}</div>`;
  } else if (policy.rate === 0) {
    refundHtml = `<div class="alert alert-warning small">${policy.reason} <strong>No refund</strong> will be issued.</div>`;
  } else if (policy.rate === 1) {
    refundHtml = `<div class="alert alert-success small">${policy.reason} You will receive a full refund of <strong>${fmtPrice(policy.refundAmount)}</strong>.</div>`;
  } else {
    refundHtml = `<div class="alert alert-warning small">${policy.reason} Refund: <strong>${fmtPrice(policy.refundAmount)}</strong> (${Math.round(policy.rate * 100)}%).</div>`;
  }

  document.getElementById('ft-cancel-body').innerHTML = `
    <p>Cancel ticket <strong>${ticket.ticket_id}</strong>?</p>
    ${refundHtml}`;
  const confirmBtn = document.getElementById('ft-cancel-confirm');
  confirmBtn.disabled = policy.blocked;

  pendingCancelId = ticket.ticket_id;
  cancelModal = new bootstrap.Modal(document.getElementById('ft-cancel-modal'));
  cancelModal.show();
}

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
    allTickets = tickets;
    const hasActive    = tickets.some((t) => t.status !== 'cancelled');
    const hasCancelled = tickets.some((t) => t.status === 'cancelled');
    tabBar.style.display = (hasCancelled || hasActive) ? 'block' : 'none';
    renderTickets();
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
