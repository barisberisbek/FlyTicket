import { Component } from './Component.js';

export class AdminLoginForm extends Component {
  template() {
    return `
    <form class="card flight-card p-3 p-md-4 mx-auto" style="max-width:420px" id="ft-admin-login">
      <h4 class="mb-3">Admin Login</h4>
      <div class="mb-3">
        <label class="form-label" for="al-user">Username</label>
        <input class="form-control" id="al-user" required />
      </div>
      <div class="mb-3">
        <label class="form-label" for="al-pass">Password</label>
        <input type="password" class="form-control" id="al-pass" required />
      </div>
      <div class="d-grid">
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
    </form>`;
  }
  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = this.el.querySelector('#al-user').value.trim();
      const password = this.el.querySelector('#al-pass').value;
      this.props.onSubmit?.({ username, password });
    });
  }
}
