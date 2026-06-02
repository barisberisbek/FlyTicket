import { Component } from './Component.js';

export class Footer extends Component {
  template() {
    return `
    <footer class="ft-footer no-print">
      <div class="container">
        <div class="row g-4">
          <div class="col-12 col-md-5">
            <div class="ft-footer-brand">
              <i class="bi bi-airplane-fill"></i> FlyTicket
            </div>
            <div class="ft-footer-tagline">Türkiye'nin dijital havayolu deneyimi.</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-uppercase fw-bold mb-2" style="font-size:.7rem;letter-spacing:.1em;color:rgba(255,255,255,.4)">Uçuşlar</div>
            <ul class="ft-footer-links">
              <li><a href="index.html"><i class="bi bi-search me-1"></i>Uçuş Ara</a></li>
              <li><a href="my-tickets.html"><i class="bi bi-ticket-perforated me-1"></i>Biletlerim</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-uppercase fw-bold mb-2" style="font-size:.7rem;letter-spacing:.1em;color:rgba(255,255,255,.4)">Hesap</div>
            <ul class="ft-footer-links">
              <li><a href="login.html"><i class="bi bi-box-arrow-in-right me-1"></i>Giriş Yap</a></li>
              <li><a href="register.html"><i class="bi bi-person-plus me-1"></i>Kayıt Ol</a></li>
              <li><a href="admin-login.html"><i class="bi bi-shield-lock me-1"></i>Admin</a></li>
            </ul>
          </div>
        </div>
        <div class="ft-footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>&copy; ${new Date().getFullYear()} FlyTicket. All rights reserved.</span>
          <span style="color:rgba(255,255,255,.3)">CENG-3502 Final Project</span>
        </div>
      </div>
    </footer>`;
  }
}
