import { Component } from './Component.js';

const CARD_ICONS = { visa: '💳', mastercard: '💳', amex: '💳', other: '💳' };
const CARD_LABELS = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', other: 'Card' };

export class SavedCardPicker extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: 'new' };
  }

  getSelected() { return this.state.selected; }

  template() {
    const cards = this.props.cards || [];
    const opts = cards.map((c) => {
      const sel = this.state.selected === c.card_id ? 'selected' : '';
      return `
      <div class="ft-card-option ${sel}" data-card="${c.card_id}">
        <div class="ft-card-icon">${CARD_ICONS[c.card_type] || '💳'}</div>
        <div class="ft-card-details">
          <div class="ft-card-name">${c.label}</div>
          <div class="ft-card-meta">${CARD_LABELS[c.card_type] || ''} •••• ${c.last_four} · Exp ${c.expiry}</div>
        </div>
        ${this.state.selected === c.card_id ? '<span class="text-primary fw-bold">✓</span>' : ''}
      </div>`;
    }).join('');

    const newSel = this.state.selected === 'new' ? 'selected' : '';
    return `
    <div>
      <p class="small text-muted mb-2">Saved cards</p>
      ${opts}
      <div class="ft-card-option ${newSel}" data-card="new">
        <div class="ft-card-icon">➕</div>
        <div class="ft-card-details">
          <div class="ft-card-name">Use a new card</div>
          <div class="ft-card-meta">Enter card details below</div>
        </div>
        ${this.state.selected === 'new' ? '<span class="text-primary fw-bold">✓</span>' : ''}
      </div>
    </div>`;
  }

  bindEvents() {
    this.el.querySelectorAll('.ft-card-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const id = opt.dataset.card;
        this.setState({ selected: id });
        this.props.onSelect?.(id === 'new' ? null : this.props.cards.find((c) => c.card_id === id));
      });
    });
  }
}
