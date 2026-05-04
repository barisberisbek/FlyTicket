import { Component } from './Component.js';

export class Spinner extends Component {
  template() {
    return `
    <div class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`;
  }
}
