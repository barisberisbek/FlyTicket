import { Component } from './Component.js';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

export class SeatMap extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: null };
  }
  getSelected() { return this.state.selected; }

  template() {
    const total = this.props.seatsTotal || 0;
    const taken = new Set(this.props.bookedSeats || []);
    const rows = Math.ceil(total / COLS.length);
    const seats = [];
    for (let r = 1; r <= rows; r++) {
      const row = [];
      for (let i = 0; i < COLS.length; i++) {
        const label = `${r}${COLS[i]}`;
        if (seats.flat().length + row.length >= total) break;
        const isTaken = taken.has(label);
        const isSel = this.state.selected === label;
        const aisle = i === 2 ? 'aisle' : '';
        const cls = `seat ${aisle} ${isTaken ? 'taken' : ''} ${isSel ? 'selected' : ''}`.trim();
        row.push(`<button type="button" class="${cls}" data-seat="${label}" ${isTaken ? 'disabled' : ''} aria-label="Seat ${label}${isTaken ? ' (taken)' : ''}">${label}</button>`);
      }
      seats.push(row);
    }
    const grid = seats.map((row, idx) =>
      `<div class="seat-row"><span class="row-label">${idx + 1}</span>${row.join('')}</div>`).join('');

    return `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Choose your seat</h6>
        <div class="legend small">
          <span><span class="swatch free"></span>Free</span>
          <span><span class="swatch selected"></span>Selected</span>
          <span><span class="swatch taken"></span>Taken</span>
        </div>
      </div>
      <div class="seat-map-wrapper">
        <div class="seat-map">${grid}</div>
      </div>
      <div class="mt-2 small">Selected: <strong>${this.state.selected || '—'}</strong></div>
    </div>`;
  }
  bindEvents() {
    this.el.querySelectorAll('.seat:not(.taken)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const seat = btn.dataset.seat;
        this.setState({ selected: this.state.selected === seat ? null : seat });
        this.props.onSelect?.(this.state.selected);
      });
    });
  }
}
