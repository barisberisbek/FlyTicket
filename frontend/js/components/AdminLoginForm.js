import { Component } from './Component.js';

export class AdminLoginForm extends Component {
  template() {
    return `
    <div class="ft-auth-wrap">
      <!-- Left: Form -->
      <div class="ft-auth-left">
        <div class="ft-auth-card">
          <a href="index.html" class="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none"
             style="color:var(--ft-navy)">
            <i class="bi bi-airplane-fill" style="font-size:1.3rem;color:var(--ft-blue)"></i>
            <span style="font-weight:800;font-size:1.1rem;letter-spacing:-0.02em">FlyTicket</span>
          </a>
          <div class="d-inline-flex align-items-center gap-2 mb-3 px-3 py-1 rounded-pill"
               style="background:var(--ft-gold-light);border:1px solid var(--ft-gold)">
            <i class="bi bi-shield-lock-fill" style="color:var(--ft-gold)"></i>
            <span style="font-size:.78rem;font-weight:700;color:var(--ft-warning)">Admin Access</span>
          </div>
          <h2 class="mb-1" style="font-weight:800;letter-spacing:-0.03em;font-size:1.6rem">Admin Sign In</h2>
          <p class="mb-4" style="color:var(--ft-text-muted);font-size:.9rem">Manage flights and bookings.</p>

          <form id="ft-admin-login" novalidate>
            <div class="mb-3">
              <label class="form-label" for="al-user">
                <i class="bi bi-person-badge me-1 text-muted"></i>Username
              </label>
              <input class="form-control" id="al-user" placeholder="admin" required />
            </div>
            <div class="mb-4">
              <label class="form-label" for="al-pass">
                <i class="bi bi-lock me-1 text-muted"></i>Password
              </label>
              <input type="password" class="form-control" id="al-pass" placeholder="••••••••" required />
            </div>
            <div class="d-grid mb-3">
              <button type="submit" class="btn btn-primary btn-lg" style="font-size:.95rem">
                <i class="bi bi-shield-check me-2"></i>Admin Sign In
              </button>
            </div>
            <div class="text-center small" style="color:var(--ft-text-muted)">
              Not an admin? <a href="index.html" style="color:var(--ft-blue);font-weight:600">Go to search</a>
            </div>
          </form>
        </div>
      </div>
      <!-- Right panel -->
      <div class="ft-auth-right">
        <div class="ft-auth-right-content">
          <div style="font-size:3rem;margin-bottom:1rem"><i class="bi bi-shield-check-fill" style="color:var(--ft-gold)"></i></div>
          <h2>Admin Control<br>Center</h2>
          <p>Manage flights, monitor bookings, and keep your airline running smoothly.</p>
          <div class="mt-4 d-flex flex-column gap-2" style="font-size:.88rem;color:rgba(255,255,255,.55)">
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Flight CRUD management</div>
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Live booking monitoring</div>
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Revenue & stats dashboard</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  bindEvents() {
    this.el.querySelector('#ft-admin-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = this.el.querySelector('#al-user').value.trim();
      const password = this.el.querySelector('#al-pass').value;
      this.props.onSubmit?.({ username, password });
    });
  }
}
