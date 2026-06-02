export function fmtDateTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtPrice(n) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0);
}

export function fmtDuration(from, to) {
  const ms = new Date(to) - new Date(from);
  if (ms <= 0) return '';
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function cityCode(name) {
  return (name || '')
    .replace(/İ/g, 'I').replace(/Ş/g, 'S').replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U').replace(/Ç/g, 'C').replace(/Ö/g, 'O')
    .replace(/ı/g, 'I').replace(/ş/g, 'S').replace(/ğ/g, 'G')
    .replace(/ü/g, 'U').replace(/ç/g, 'C').replace(/ö/g, 'O')
    .substring(0, 3).toUpperCase();
}

export function toLocalInput(d) {
  if (!d) return '';
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
