import { Component } from './Component.js';

const COLOR_MAP = {
  'text-primary': 'blue',
  'text-success': 'green',
  'text-warning': 'gold',
  'text-danger':  'red',
};
const TEXT_COLOR = {
  blue:  'var(--ft-blue)',
  green: 'var(--ft-success)',
  gold:  'var(--ft-gold)',
  red:   'var(--ft-danger)',
};
const BI_ICON = {
  blue:  'bi-airplane-fill',
  green: 'bi-ticket-perforated-fill',
  gold:  'bi-currency-exchange',
  red:   'bi-bar-chart-fill',
};

export class StatCard extends Component {
  template() {
    const { label, value, sub, colorClass = 'text-primary' } = this.props;
    const color = COLOR_MAP[colorClass] || 'blue';
    const textColor = TEXT_COLOR[color];
    const biIcon = BI_ICON[color];

    return `
    <div class="ft-stat-card-v2 ${color}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="ft-stat-label">${label}</div>
          <div class="ft-stat-value" style="color:${textColor}">${value}</div>
          ${sub ? `<div class="ft-stat-sub">${sub}</div>` : ''}
        </div>
        <div class="ft-stat-icon" style="color:${textColor}">
          <i class="bi ${biIcon}"></i>
        </div>
      </div>
    </div>`;
  }
}
