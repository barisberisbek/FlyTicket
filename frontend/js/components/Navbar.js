import { Component } from './Component.js';
import { getCurrentUser, logoutUser, getCurrentAdmin, logoutAdmin } from '../utils/auth.js';

export class Navbar extends Component {
  template() {
    const user = getCurrentUser();
    const admin = getCurrentAdmin();
    return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
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
          <ul class="navbar-nav">
            ${admin ? `
              <li class="nav-item"><a class="nav-link" href="admin-dashboard.html">Dashboard</a></li>
              <li class="nav-item"><a class="nav-link" href="admin-bookings.html">Bookings</a></li>
              <li class="nav-item"><button class="btn btn-link nav-link" id="ft-admin-logout">Admin Logout</button></li>
            ` : ''}
            ${user ? `
              <li class="nav-item"><span class="nav-link">Hi, ${user.name}</span></li>
              <li class="nav-item"><button class="btn btn-link nav-link" id="ft-user-logout">Logout</button></li>
            ` : `
              <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
              <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
              <li class="nav-item"><a class="nav-link" href="admin-login.html">Admin</a></li>
            `}
          </ul>
        </div>
      </div>
    </nav>`;
  }
  bindEvents() {
    this.el.querySelector('#ft-user-logout')?.addEventListener('click', () => {
      logoutUser(); window.location.href = 'index.html';
    });
    this.el.querySelector('#ft-admin-logout')?.addEventListener('click', () => {
      logoutAdmin(); window.location.href = 'admin-login.html';
    });
  }
}
