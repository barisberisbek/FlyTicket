import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

export function initTheme() {
  const saved = localStorage.getItem('ft_theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
}

export function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('ft_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('ft_theme', 'dark');
  }
}

export function mountChrome() {
  initTheme();
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
