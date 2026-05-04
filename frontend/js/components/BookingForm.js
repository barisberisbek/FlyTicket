import { Component } from './Component.js';
import { isEmail } from '../utils/validators.js';

export class BookingForm extends Component {
  template() {
    const u = this.props.user || {};
    return `
    <form class="card flight-card p-3 p-md-4" id="ft-booking-form" novalidate>
      <h5 class="mb-3">Passenger details</h5>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label" for="bf-name">First name</label>
          <input class="form-control" id="bf-name" required value="${u.name || ''}" />
          <div class="invalid-feedback">Please enter a name.</div>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="bf-surname">Surname</label>
          <input class="form-control" id="bf-surname" required value="${u.surname || ''}" />
          <div class="invalid-feedback">Please enter a surname.</div>
        </div>
        <div class="col-12">
          <label class="form-label" for="bf-email">Email</label>
          <input type="email" class="form-control" id="bf-email" required value="${u.email || ''}" />
          <div class="invalid-feedback">Please enter a valid email.</div>
        </div>
      </div>
      <div class="d-grid mt-3">
        <button type="submit" class="btn btn-primary" id="bf-submit">Continue to payment</button>
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.el.querySelector('#bf-name').value.trim();
      const surname = this.el.querySelector('#bf-surname').value.trim();
      const email = this.el.querySelector('#bf-email').value.trim();
      let ok = true;
      [['#bf-name', !!name], ['#bf-surname', !!surname], ['#bf-email', isEmail(email)]].forEach(([sel, valid]) => {
        const inp = this.el.querySelector(sel);
        inp.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      this.props.onSubmit?.({ passenger_name: name, passenger_surname: surname, passenger_email: email });
    });
  }
}
