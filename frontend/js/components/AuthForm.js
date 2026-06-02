import { Component } from './Component.js';
import { isEmail } from '../utils/validators.js';

export class AuthForm extends Component {
  template() {
    const isRegister = this.props.mode === 'register';
    return `
    <div class="ft-auth-wrap">
      <!-- Left: Form -->
      <div class="ft-auth-left">
        <div class="ft-auth-card">
          <!-- Brand -->
          <a href="index.html" class="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none"
             style="color:var(--ft-navy)">
            <i class="bi bi-airplane-fill" style="font-size:1.3rem;color:var(--ft-blue)"></i>
            <span style="font-weight:800;font-size:1.1rem;letter-spacing:-0.02em">FlyTicket</span>
          </a>

          <h2 class="mb-1" style="font-weight:800;letter-spacing:-0.03em;font-size:1.6rem">
            ${isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p class="mb-4" style="color:var(--ft-text-muted);font-size:.9rem">
            ${isRegister
              ? 'Join thousands of travellers on FlyTicket.'
              : 'Sign in to manage your bookings.'}
          </p>

          <form id="ft-auth-form" novalidate>
            ${isRegister ? `
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label" for="af-name">
                  <i class="bi bi-person me-1 text-muted"></i>First name
                </label>
                <input class="form-control" id="af-name" placeholder="Ali" required />
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-6">
                <label class="form-label" for="af-surname">
                  <i class="bi bi-person me-1 text-muted"></i>Surname
                </label>
                <input class="form-control" id="af-surname" placeholder="Yılmaz" required />
                <div class="invalid-feedback">Required.</div>
              </div>
            </div>` : ''}

            <div class="mb-3">
              <label class="form-label" for="af-email">
                <i class="bi bi-envelope me-1 text-muted"></i>Email address
              </label>
              <input type="email" class="form-control" id="af-email"
                placeholder="you@example.com" required />
              <div class="invalid-feedback">Please enter a valid email.</div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="af-password">
                <i class="bi bi-lock me-1 text-muted"></i>Password
              </label>
              <input type="password" class="form-control" id="af-password"
                placeholder="Min. 6 characters" required minlength="6" />
              <div class="invalid-feedback">Min 6 characters.</div>
            </div>

            <div class="d-grid mb-3">
              <button type="submit" class="btn btn-primary btn-lg" style="font-size:.95rem">
                ${isRegister ? '<i class="bi bi-person-plus me-2"></i>Create Account' : '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In'}
              </button>
            </div>

            <div class="text-center small" style="color:var(--ft-text-muted)">
              ${isRegister
                ? `Already have an account? <a href="login.html" style="color:var(--ft-blue);font-weight:600">Sign in</a>`
                : `New to FlyTicket? <a href="register.html" style="color:var(--ft-blue);font-weight:600">Create account</a>`}
            </div>
          </form>
        </div>
      </div>

      <!-- Right: Decorative panel -->
      <div class="ft-auth-right">
        <div class="ft-auth-right-content">
          <div style="font-size:3.5rem;margin-bottom:1rem;animation:heroFloat 4s ease-in-out infinite">✈</div>
          <h2>Fly Anywhere<br>in Türkiye</h2>
          <p>Book domestic flights to all 81 provinces instantly. Fast, simple, affordable.</p>
          <div class="mt-4 d-flex flex-column gap-2" style="font-size:.88rem;color:rgba(255,255,255,.55)">
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Instant e-ticket delivery</div>
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Seat selection included</div>
            <div><i class="bi bi-check-circle-fill me-2" style="color:#34d399"></i>Easy booking management</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  bindEvents() {
    this.el.addEventListener('submit', (e) => {
      e.preventDefault();
      const isRegister = this.props.mode === 'register';
      const email    = this.el.querySelector('#af-email').value.trim();
      const password = this.el.querySelector('#af-password').value;
      const data     = { email, password };
      let ok = isEmail(email) && password.length >= 6;
      this.el.querySelector('#af-email').classList.toggle('is-invalid', !isEmail(email));
      this.el.querySelector('#af-password').classList.toggle('is-invalid', password.length < 6);
      if (isRegister) {
        const name    = this.el.querySelector('#af-name').value.trim();
        const surname = this.el.querySelector('#af-surname').value.trim();
        data.name = name; data.surname = surname;
        if (!name || !surname) ok = false;
      }
      if (!ok) return;
      this.props.onSubmit?.(data);
    });
  }
}
