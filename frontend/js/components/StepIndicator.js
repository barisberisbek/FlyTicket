import { Component } from './Component.js';

const STEPS = [
  { n: 1, icon: '🔍', label: 'Search' },
  { n: 2, icon: '💺', label: 'Select Seat' },
  { n: 3, icon: '💳', label: 'Payment' },
  { n: 4, icon: '✅', label: 'Confirm' },
];

export class StepIndicator extends Component {
  template() {
    const current = this.props.currentStep || 1;
    const parts = STEPS.map((s, i) => {
      const cls = s.n < current ? 'done' : s.n === current ? 'active' : '';
      const icon = s.n < current ? '✓' : s.icon;
      const sep = i < STEPS.length - 1
        ? `<span class="ft-step-sep">›</span>` : '';
      return `
        <span class="ft-step ${cls}">
          <span>${icon}</span>
          <span class="ft-step-label">${s.label}</span>
        </span>${sep}`;
    }).join('');
    return `<div class="ft-steps no-print">${parts}</div>`;
  }
}
