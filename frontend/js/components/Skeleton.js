import { Component } from './Component.js';

export class Skeleton extends Component {
  constructor(props = {}) { super(props); }

  template() {
    const count = this.props.count || 4;
    const cards = Array.from({ length: count }, (_, i) => `
      <div class="ft-skeleton-card" style="animation-delay:${i * 80}ms">
        <div class="d-flex justify-content-between mb-2">
          <div class="ft-skeleton ft-skeleton-line wide"></div>
          <div class="ft-skeleton ft-skeleton-line short" style="width:15%"></div>
        </div>
        <div class="ft-skeleton ft-skeleton-line med"></div>
        <div class="ft-skeleton ft-skeleton-line short mt-3" style="width:22%"></div>
      </div>`).join('');
    return `<div>${cards}</div>`;
  }
}
