import { Component } from './Component.js';
import { getCurrentUser, logoutUser, getCurrentAdmin, logoutAdmin } from '../utils/auth.js';
import { toggleTheme } from '../app.js';

export class Navbar extends Component {
  template() {
    const user  = getCurrentUser();
    const admin = getCurrentAdmin();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeIcon = isDark
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-fill"></i>';

    return `
    <nav class="navbar navbar-expand-lg shadow-none">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <i class="bi bi-airplane-fill me-1"></i>FlyTicket
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nv" style="color:var(--ft-text-muted)">
          <i class="bi bi-list" style="font-size:1.4rem"></i>
        </button>
        <div class="collapse navbar-collapse" id="nv">
          <ul class="navbar-nav me-auto gap-1 mt-2 mt-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="index.html">
                <i class="bi bi-search me-1"></i>Search Flights
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="my-tickets.html">
                <i class="bi bi-ticket-perforated me-1"></i>My Tickets
              </a>
            </li>
          </ul>
          <ul class="navbar-nav align-items-lg-center gap-1 mt-2 mt-lg-0">
            <li class="nav-item">
              <button id="ft-theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode">${themeIcon}</button>
            </li>
            ${admin ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center gap-1" href="#" data-bs-toggle="dropdown">
                  <i class="bi bi-shield-check"></i> Admin
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="admin-dashboard.html"><i class="bi bi-airplane me-2 text-primary"></i>Flights</a></li>
                  <li><a class="dropdown-item" href="admin-bookings.html"><i class="bi bi-ticket-perforated me-2 text-primary"></i>Bookings</a></li>
                  <li><a class="dropdown-item" href="admin-settings.html"><i class="bi bi-gear me-2 text-primary"></i>Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" id="ft-admin-logout"><i class="bi bi-box-arrow-left me-2"></i>Logout</button></li>
                </ul>
              </li>
            ` : ''}
            ${user ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center gap-1" href="#" data-bs-toggle="dropdown">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white"
                    style="width:1.8rem;height:1.8rem;font-size:.78rem;font-weight:700">
                    ${user.name.charAt(0).toUpperCase()}
                  </span>
                  <span class="ms-1">${user.name}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2 text-primary"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="my-tickets.html"><i class="bi bi-ticket-perforated me-2 text-primary"></i>My Tickets</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" id="ft-user-logout"><i class="bi bi-box-arrow-left me-2"></i>Logout</button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
              <li class="nav-item">
                <a class="btn btn-primary btn-sm px-3" href="register.html" style="font-size:.82rem">Register</a>
              </li>
              ${!admin ? `<li class="nav-item ms-1"><a class="nav-link" href="admin-login.html" style="font-size:.8rem;opacity:.6"><i class="bi bi-shield-lock me-1"></i>Admin</a></li>` : ''}
            `}
          </ul>
        </div>
      </div>
    </nav>`;
  }

  bindEvents() {
    this.el.querySelector('#ft-theme-toggle')?.addEventListener('click', () => {
      toggleTheme(); this.update();
    });
    this.el.querySelector('#ft-user-logout')?.addEventListener('click', () => {
      logoutUser(); window.location.href = 'index.html';
    });
    this.el.querySelector('#ft-admin-logout')?.addEventListener('click', () => {
      logoutAdmin(); window.location.href = 'admin-login.html';
    });
  }
}
