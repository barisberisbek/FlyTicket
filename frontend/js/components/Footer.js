import { Component } from './Component.js';

export class Footer extends Component {
  template() {
    return `
    <footer class="bg-dark text-light py-3 mt-auto no-print">
      <div class="container d-flex flex-wrap justify-content-between small">
        <span>&copy; ${new Date().getFullYear()} FlyTicket. All rights reserved.</span>
        <span>CENG-3502 Final Project</span>
      </div>
    </footer>`;
  }
}
