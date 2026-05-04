import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

export function mountChrome() {
  const navHost = document.getElementById('navbar');
  const footHost = document.getElementById('footer');
  if (navHost) new Navbar().mount(navHost);
  if (footHost) new Footer().mount(footHost);
}

export function appHost() {
  return document.getElementById('app');
}

export function setPageTitle(t) {
  document.title = `FlyTicket – ${t}`;
}
