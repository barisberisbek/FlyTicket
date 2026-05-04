import { Component } from './Component.js';
import { luhn, isExpiry, isCvv } from '../utils/validators.js';

export class PaymentForm extends Component {
  template() {
    return `
    <form class="card flight-card p-3 p-md-4" id="ft-payment-form" novalidate>
      <h5 class="mb-3">Payment details (simulation)</h5>
      <div class="alert alert-warning small">
        This is a simulated payment. Use any valid Luhn-checksum card number, e.g. <code>4111 1111 1111 1111</code>.
      </div>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label" for="pf-name">Name on card</label>
          <input class="form-control" id="pf-name" required />
          <div class="invalid-feedback">Required.</div>
        </div>
        <div class="col-12">
          <label class="form-label" for="pf-card">Card number</label>
          <input class="form-control" id="pf-card" inputmode="numeric" placeholder="4111 1111 1111 1111" required />
          <div class="invalid-feedback">Invalid card number.</div>
        </div>
        <div class="col-6">
          <label class="form-label" for="pf-exp">Expiry (MM/YY)</label>
          <input class="form-control" id="pf-exp" placeholder="12/29" required />
          <div class="invalid-feedback">Use MM/YY format.</div>
        </div>
        <div class="col-6">
          <label class="form-label" for="pf-cvv">CVV</label>
          <input class="form-control" id="pf-cvv" inputmode="numeric" required />
          <div class="invalid-feedback">3 or 4 digits.</div>
        </div>
      </div>
      <div class="d-grid mt-3">
        <button type="submit" class="btn btn-success" id="pf-submit">
          Pay <span id="pf-amount"></span>
        </button>
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.querySelector('#pf-amount').textContent = this.props.amountText || '';
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.el.querySelector('#pf-name').value.trim();
      const card = this.el.querySelector('#pf-card').value.trim();
      const exp = this.el.querySelector('#pf-exp').value.trim();
      const cvv = this.el.querySelector('#pf-cvv').value.trim();
      const checks = [
        ['#pf-name', !!name],
        ['#pf-card', luhn(card)],
        ['#pf-exp', isExpiry(exp)],
        ['#pf-cvv', isCvv(cvv)],
      ];
      let ok = true;
      checks.forEach(([sel, valid]) => {
        this.el.querySelector(sel).classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      const btn = this.el.querySelector('#pf-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
      this.props.onSubmit?.({ cardNumber: card.replace(/\s+/g, ''), expiry: exp, cvv, name });
    });
  }
}
