import { Component } from './Component.js';

const STEPS = [
  { n: 1, label: 'Search' },
  { n: 2, label: 'Select Seat' },
  { n: 3, label: 'Payment' },
  { n: 4, label: 'Confirm' },
];

export class StepIndicator extends Component {
  template() {
    const current = this.props.currentStep || 1;
    const parts = STEPS.map((s) => {
      const done   = s.n < current;
      const active = s.n === current;
      const cls = done ? 'done' : active ? 'active' : '';
      const circleContent = done
        ? '<i class="bi bi-check"></i>'
        : s.n;
      return `
        <div class="ft-step-v2 ${cls}">
          <div class="ft-step-v2-circle">${circleContent}</div>
          <div class="ft-step-v2-label">${s.label}</div>
        </div>`;
    }).join('');
    return `<div class="ft-steps-v2 no-print">${parts}</div>`;
  }
}
