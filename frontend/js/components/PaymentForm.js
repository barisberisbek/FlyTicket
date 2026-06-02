import { Component } from './Component.js';
import { luhn, isExpiry, isCvv } from '../utils/validators.js';

export class PaymentForm extends Component {
  template() {
    return `
    <div class="card p-3 p-md-4" id="ft-payment-form-wrap">
      <div class="d-flex align-items-center gap-2 mb-4">
        <div style="width:2.4rem;height:2.4rem;background:var(--ft-blue-light);border-radius:.6rem;display:flex;align-items:center;justify-content:center">
          <i class="bi bi-credit-card-fill" style="color:var(--ft-blue);font-size:1.1rem"></i>
        </div>
        <div>
          <div class="fw-700" style="font-size:.95rem">Payment Details</div>
          <div style="font-size:.75rem;color:var(--ft-text-muted)">Secure simulated payment</div>
        </div>
      </div>
      <div class="alert alert-warning small mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill flex-shrink-0"></i>
        <span>Simulated payment. Use any valid Luhn card, e.g. <code>4111 1111 1111 1111</code>.</span>
      </div>
      <form id="ft-payment-form" novalidate>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label" for="pf-name">
              <i class="bi bi-person me-1 text-muted"></i>Name on card
            </label>
            <input class="form-control" id="pf-name" placeholder="John Doe" required />
            <div class="invalid-feedback">Required.</div>
          </div>
          <div class="col-12">
            <label class="form-label" for="pf-card">
              <i class="bi bi-credit-card me-1 text-muted"></i>Card number
            </label>
            <input class="form-control" id="pf-card" inputmode="numeric"
              placeholder="4111 1111 1111 1111" required />
            <div class="invalid-feedback">Invalid card number.</div>
          </div>
          <div class="col-6">
            <label class="form-label" for="pf-exp">
              <i class="bi bi-calendar3 me-1 text-muted"></i>Expiry
            </label>
            <input class="form-control" id="pf-exp" placeholder="MM/YY" required />
            <div class="invalid-feedback">Use MM/YY format.</div>
          </div>
          <div class="col-6">
            <label class="form-label" for="pf-cvv">
              <i class="bi bi-shield-lock me-1 text-muted"></i>CVV
            </label>
            <input class="form-control" id="pf-cvv" inputmode="numeric"
              placeholder="123" required />
            <div class="invalid-feedback">3 or 4 digits.</div>
          </div>
        </div>
        <div class="d-grid mt-4">
          <button type="submit" class="btn btn-primary btn-lg" id="pf-submit">
            <i class="bi bi-lock-fill me-2"></i>Pay <span id="pf-amount"></span>
          </button>
        </div>
      </form>
    </div>`;
  }

  bindEvents() {
    this.el.querySelector('#pf-amount').textContent = this.props.amountText || '';
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.el.querySelector('#pf-name').value.trim();
      const card = this.el.querySelector('#pf-card').value.trim();
      const exp  = this.el.querySelector('#pf-exp').value.trim();
      const cvv  = this.el.querySelector('#pf-cvv').value.trim();
      const checks = [
        ['#pf-name', !!name],
        ['#pf-card', luhn(card)],
        ['#pf-exp',  isExpiry(exp)],
        ['#pf-cvv',  isCvv(cvv)],
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
