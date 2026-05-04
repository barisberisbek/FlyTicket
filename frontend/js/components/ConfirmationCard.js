import { Component } from './Component.js';

export class ConfirmationCard extends Component {
  template() {
    return `
    <div class="alert alert-success d-flex align-items-center gap-3 no-print" role="alert">
      <span style="font-size:2rem" aria-hidden="true">&#10003;</span>
      <div>
        <h4 class="mb-1">Booking confirmed!</h4>
        <div>${this.props.message || 'Your e-ticket has been generated and emailed to you.'}</div>
      </div>
    </div>`;
  }
}
