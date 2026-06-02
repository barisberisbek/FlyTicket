import { Component } from './Component.js';

export class StatCard extends Component {
  template() {
    const { icon, label, value, sub, colorClass = 'text-primary' } = this.props;
    return `
    <div class="ft-stat-card">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="ft-stat-label text-muted">${label}</div>
          <div class="ft-stat-value ${colorClass}">${value}</div>
          ${sub ? `<div class="ft-stat-sub">${sub}</div>` : ''}
        </div>
        <div class="ft-stat-icon ${colorClass}">${icon}</div>
      </div>
    </div>`;
  }
}
