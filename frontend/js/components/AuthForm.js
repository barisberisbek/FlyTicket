import { Component } from './Component.js';
import { isEmail } from '../utils/validators.js';

export class AuthForm extends Component {
  template() {
    const isRegister = this.props.mode === 'register';
    return `
    <form class="card flight-card p-3 p-md-4 mx-auto" style="max-width:480px" id="ft-auth-form" novalidate>
      <h4 class="mb-3">${isRegister ? 'Create account' : 'Login'}</h4>
      ${isRegister ? `
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label" for="af-name">First name</label>
            <input class="form-control" id="af-name" required />
          </div>
          <div class="col-6">
            <label class="form-label" for="af-surname">Surname</label>
            <input class="form-control" id="af-surname" required />
          </div>
        </div>` : ''}
      <div class="mt-3">
        <label class="form-label" for="af-email">Email</label>
        <input type="email" class="form-control" id="af-email" required />
        <div class="invalid-feedback">Please enter a valid email.</div>
      </div>
      <div class="mt-3">
        <label class="form-label" for="af-password">Password</label>
        <input type="password" class="form-control" id="af-password" required minlength="6" />
        <div class="invalid-feedback">Min 6 characters.</div>
      </div>
      <div class="d-grid mt-3">
        <button type="submit" class="btn btn-primary">${isRegister ? 'Register' : 'Login'}</button>
      </div>
      <div class="text-center mt-3 small">
        ${isRegister
          ? 'Already have an account? <a href="login.html">Login</a>'
          : 'New to FlyTicket? <a href="register.html">Register</a>'}
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const isRegister = this.props.mode === 'register';
      const email = this.el.querySelector('#af-email').value.trim();
      const password = this.el.querySelector('#af-password').value;
      const data = { email, password };
      let ok = isEmail(email) && password.length >= 6;
      this.el.querySelector('#af-email').classList.toggle('is-invalid', !isEmail(email));
      this.el.querySelector('#af-password').classList.toggle('is-invalid', password.length < 6);
      if (isRegister) {
        const name = this.el.querySelector('#af-name').value.trim();
        const surname = this.el.querySelector('#af-surname').value.trim();
        data.name = name; data.surname = surname;
        if (!name || !surname) ok = false;
      }
      if (!ok) return;
      this.props.onSubmit?.(data);
    });
  }
}
