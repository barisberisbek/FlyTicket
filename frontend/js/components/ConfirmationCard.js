import { Component } from './Component.js';

export class ConfirmationCard extends Component {
  template() {
    return `
    <div class="ft-confirmed no-print">
      <div class="ft-check-circle">
        <i class="bi bi-check-lg"></i>
      </div>
      <h3 class="fw-800 mb-1" style="font-weight:800;letter-spacing:-0.02em">Booking Confirmed!</h3>
      <p class="mb-0" style="color:var(--ft-success);font-weight:500">
        ${this.props.message || 'Your e-ticket has been generated and emailed to you.'}
      </p>
    </div>`;
  }
}
