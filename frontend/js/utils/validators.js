export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

export function luhn(num) {
  const s = String(num || '').replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0, alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

export function isExpiry(s) {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(s || '').trim());
}

export function isCvv(s) {
  return /^\d{3,4}$/.test(String(s || '').trim());
}
