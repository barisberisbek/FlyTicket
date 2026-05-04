import { Component } from './Component.js';
import { FlightCard } from './FlightCard.js';

export class FlightList extends Component {
  constructor(props) { super(props); this.state = { flights: props.flights || [], loading: false }; }
  setFlights(flights) { this.setState({ flights, loading: false }); }
  setLoading(loading) { this.setState({ loading }); }

  template() {
    if (this.state.loading) {
      return `<div class="text-center my-4"><div class="spinner-border text-primary" role="status"></div></div>`;
    }
    if (!this.state.flights.length) {
      return `<div class="alert alert-info">No flights found. Try a different search.</div>`;
    }
    return `<div id="ft-flight-list"></div>`;
  }
  bindEvents() {
    if (this.state.loading || !this.state.flights.length) return;
    const host = this.el;
    this.state.flights.forEach((f) => new FlightCard({ flight: f }).mount(host));
  }
}
