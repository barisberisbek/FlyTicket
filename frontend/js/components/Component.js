export class Component {
  constructor(props = {}) { this.props = props; this.state = {}; this.el = null; }
  setState(patch) { this.state = { ...this.state, ...patch }; this.update(); }
  template() { return ''; }
  bindEvents() {}
  mount(parent) {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template().trim();
    this.el = wrap.firstElementChild;
    parent.appendChild(this.el);
    this.bindEvents();
    return this.el;
  }
  update() {
    if (!this.el) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template().trim();
    const nextEl = wrap.firstElementChild;
    this.el.replaceWith(nextEl);
    this.el = nextEl;
    this.bindEvents();
  }
  unmount() { this.el?.remove(); this.el = null; }
}
