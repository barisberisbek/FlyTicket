import { Component } from './Component.js';
import { fmtPrice } from '../utils/format.js';
import { calcRefund } from '../utils/cancellationPolicy.js';

export class CancelModal extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, error: null };
  }

  template() {
    const { ticket, flight } = this.props;
    const dep = flight?.departure_time || flight?.flight_id?.departure_time;
    const price = flight?.price || flight?.flight_id?.price || 0;
    const policy = dep ? calcRefund(dep, price) : { rate: 0, refundAmount: 0, blocked: true, reason: 'Unknown departure time.' };

    const refundLine = policy.blocked
      ? `<div class="alert alert-danger small">${policy.reason}</div>`
      : policy.rate === 1
        ? `<div class="alert alert-success small">Full refund: <strong>${fmtPrice(policy.refundAmount)}</strong></div>`
        : policy.rate === 0
          ? `<div class="alert alert-warning small">${policy.reason} No refund will be issued.</div>`
          : `<div class="alert alert-warning small">${policy.reason} Refund: <strong>${fmtPrice(policy.refundAmount)}</strong> (${Math.round(policy.rate * 100)}%)</div>`;

    return `
    <div class="modal fade" id="ft-cancel-modal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cancel Ticket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>You are about to cancel ticket <strong>${ticket?.ticket_id || ''}</strong>.</p>
            ${refundLine}
            ${this.state.error ? `<div class="alert alert-danger small">${this.state.error}</div>` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Keep ticket</button>
            <button class="btn btn-danger" id="ft-cancel-confirm"
              ${policy.blocked ? 'disabled' : ''}
              ${this.state.loading ? 'disabled' : ''}>
              ${this.state.loading ? '<span class="spinner-border spinner-border-sm me-1"></span>' : ''}
              ${policy.blocked ? 'Cannot cancel' : 'Yes, cancel ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  bindEvents() {
    const btn = this.el.querySelector('#ft-cancel-confirm');
    if (btn) {
      btn.addEventListener('click', () => {
        this.setState({ loading: true, error: null });
        this.props.onConfirm?.();
      });
    }
  }

  show() {
    const modal = new bootstrap.Modal(this.el.querySelector('#ft-cancel-modal'));
    modal.show();
    return modal;
  }

  setError(msg) { this.setState({ loading: false, error: msg }); }
}
