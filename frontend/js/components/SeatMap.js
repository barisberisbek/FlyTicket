import { Component } from './Component.js';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

export class SeatMap extends Component {
  constructor(props) {
    super(props);
    // selected is a Set for multi-select support
    this.state = { selected: new Set() };
  }

  /** Returns array of selected seat labels */
  getSelected() {
    const arr = [...this.state.selected];
    return arr.length === 0 ? [] : arr;
  }

  /** Returns single seat (backwards compat) or first selected */
  getSelectedSingle() {
    const arr = [...this.state.selected];
    return arr[0] || null;
  }

  template() {
    const total    = this.props.seatsTotal || 0;
    const taken    = new Set(this.props.bookedSeats || []);
    const maxSel   = this.props.maxSelect || 1;
    const rows     = Math.ceil(total / COLS.length);
    const seats    = [];

    for (let r = 1; r <= rows; r++) {
      const row = [];
      for (let i = 0; i < COLS.length; i++) {
        const label = `${r}${COLS[i]}`;
        if (seats.flat().length + row.length >= total) break;
        const isTaken = taken.has(label);
        const isSel   = this.state.selected.has(label);
        const aisle   = i === 2 ? 'aisle' : '';
        const cls     = `seat ${aisle} ${isTaken ? 'taken' : ''} ${isSel ? 'selected' : ''}`.trim();
        row.push(`<button type="button" class="${cls}" data-seat="${label}"
          ${isTaken ? 'disabled' : ''}
          aria-label="Seat ${label}${isTaken ? ' (taken)' : ''}">${label}</button>`);
      }
      seats.push(row);
    }
    const grid = seats.map((row, idx) => {
      const rowNum = idx + 1;
      return `<div class="seat-row" data-row="${rowNum}"><span class="row-label">${rowNum}</span>${row.join('')}</div>`;
    }).join('');

    const selArr = [...this.state.selected];
    const selText = selArr.length === 0 ? '—' : selArr.join(', ');
    const maxNote = maxSel > 1
      ? `<span class="badge bg-secondary ms-2" style="font-size:.7rem">Select ${maxSel}</span>` : '';

    return `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-700">Choose Your Seat ${maxNote}</h6>
        <div class="legend small">
          <span><span class="swatch free"></span>Free</span>
          <span><span class="swatch selected"></span>Selected</span>
          <span><span class="swatch taken"></span>Taken</span>
        </div>
      </div>
      <div class="seat-map-wrapper">
        <div class="ft-cabin-class-label ft-cabin-business">
          <i class="bi bi-star-fill me-1"></i>Business (Rows 1–3)
        </div>
        <div class="ft-col-labels">
          <span style="width:1.6rem"></span>
          <span class="ft-col-label">A</span>
          <span class="ft-col-label">B</span>
          <span class="ft-col-label">C</span>
          <span style="width:.6rem"></span>
          <span class="ft-col-label">D</span>
          <span class="ft-col-label">E</span>
          <span class="ft-col-label">F</span>
        </div>
        <div class="seat-map">${grid.split('data-row="3"').join('data-row="3" id="last-biz"')}</div>
        <hr class="ft-cabin-divider" />
        <div class="ft-cabin-class-label ft-cabin-economy">Economy</div>
      </div>
      <div class="mt-2 small fw-600">
        <i class="bi bi-geo-alt me-1" style="color:var(--ft-blue)"></i>
        Selected: <span style="color:var(--ft-blue)">${selText}</span>
      </div>
    </div>`;
  }

  bindEvents() {
    const maxSel = this.props.maxSelect || 1;
    this.el.querySelectorAll('.seat:not(.taken)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const seat = btn.dataset.seat;
        const newSet = new Set(this.state.selected);
        if (newSet.has(seat)) {
          newSet.delete(seat);
        } else {
          if (newSet.size >= maxSel) {
            if (maxSel === 1) newSet.clear();
            else return; // max reached
          }
          newSet.add(seat);
        }
        this.setState({ selected: newSet });
        this.props.onSelect?.([...newSet]);
      });
    });
  }
}
