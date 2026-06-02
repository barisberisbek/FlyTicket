import { Component } from './Component.js';
import { getCurrentUser, logoutUser, getCurrentAdmin, logoutAdmin } from '../utils/auth.js';
import { toggleTheme } from '../app.js';

export class Navbar extends Component {
  template() {
    const user = getCurrentUser();
    const admin = getCurrentAdmin();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeIcon = isDark ? '☀️' : '🌙';

    return `
    <nav class="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand brand-logo" href="index.html">
          <span aria-hidden="true">&#9992;</span> FlyTicket
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nv">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nv">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" href="index.html">Search Flights</a></li>
            <li class="nav-item"><a class="nav-link" href="my-tickets.html">My Tickets</a></li>
          </ul>
          <ul class="navbar-nav align-items-lg-center gap-1">
            <li class="nav-item">
              <button id="ft-theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode">${themeIcon}</button>
            </li>
            ${admin ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  ⚙ Admin
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="admin-dashboard.html">✈ Flights</a></li>
                  <li><a class="dropdown-item" href="admin-bookings.html">🎫 Bookings</a></li>
                  <li><a class="dropdown-item" href="admin-settings.html">🔒 Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" id="ft-admin-logout">Logout</button></li>
                </ul>
              </li>
            ` : ''}
            ${user ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  👤 ${user.name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                  <li><a class="dropdown-item" href="my-tickets.html">My Tickets</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" id="ft-user-logout">Logout</button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
              <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
              ${!admin ? `<li class="nav-item"><a class="nav-link" href="admin-login.html">Admin</a></li>` : ''}
            `}
          </ul>
        </div>
      </div>
    </nav>`;
  }

  bindEvents() {
    this.el.querySelector('#ft-theme-toggle')?.addEventListener('click', () => {
      toggleTheme();
      this.update();
    });
    this.el.querySelector('#ft-user-logout')?.addEventListener('click', () => {
      logoutUser(); window.location.href = 'index.html';
    });
    this.el.querySelector('#ft-admin-logout')?.addEventListener('click', () => {
      logoutAdmin(); window.location.href = 'admin-login.html';
    });
  }
}
