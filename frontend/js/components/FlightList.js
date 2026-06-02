import { Component } from './Component.js';
import { FlightCard } from './FlightCard.js';
import { Skeleton } from './Skeleton.js';

export class FlightList extends Component {
  constructor(props) {
    super(props);
    this.state = { flights: props.flights || [], loading: false, sort: 'time' };
  }

  setFlights(flights) { this.setState({ flights, loading: false }); }
  setLoading(v)       { this.setState({ loading: v }); }

  getSorted() {
    const arr = [...this.state.flights];
    if (this.state.sort === 'price_asc')  return arr.sort((a, b) => a.price - b.price);
    if (this.state.sort === 'price_desc') return arr.sort((a, b) => b.price - a.price);
    return arr.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
  }

  template() {
    const count = this.state.flights.length;
    if (this.state.loading) return `<div id="ft-list-root"><div id="ft-skeleton-host"></div></div>`;

    const sortBar = count > 0 ? `
      <div class="ft-sort-bar">
        <span class="ft-sort-count"><i class="bi bi-airplane me-1"></i>${count} flight${count !== 1 ? 's' : ''} found</span>
        <div class="ms-auto d-flex gap-1">
          <button class="ft-sort-btn ${this.state.sort === 'time' ? 'active' : ''}" data-sort="time"><i class="bi bi-clock me-1"></i>Time</button>
          <button class="ft-sort-btn ${this.state.sort === 'price_asc' ? 'active' : ''}" data-sort="price_asc">₺ ↑</button>
          <button class="ft-sort-btn ${this.state.sort === 'price_desc' ? 'active' : ''}" data-sort="price_desc">₺ ↓</button>
        </div>
      </div>` : '';

    return `<div id="ft-list-root"><div>${sortBar}</div><div id="ft-flight-list"></div></div>`;
  }

  bindEvents() {
    this.el.querySelectorAll('[data-sort]').forEach((btn) => {
      btn.addEventListener('click', () => this.setState({ sort: btn.dataset.sort }));
    });

    if (this.state.loading) {
      const host = this.el.querySelector('#ft-skeleton-host');
      if (host) new Skeleton({ count: 5 }).mount(host);
      return;
    }

    const listEl = this.el.querySelector('#ft-flight-list');
    if (!listEl) return;

    const sorted = this.getSorted();
    if (!sorted.length) {
      listEl.innerHTML = `<div class="alert alert-info">No flights found. Try a different search.</div>`;
      return;
    }
    sorted.forEach((f, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'ft-animate-in';
      wrap.style.animationDelay = `${i * 55}ms`;
      listEl.appendChild(wrap);
      new FlightCard({ flight: f }).mount(wrap);
    });
  }
}
