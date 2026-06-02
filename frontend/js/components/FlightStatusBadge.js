export function flightStatusBadgeHtml(status) {
  if (!status || status === 'scheduled') {
    return `<span class="ft-status-badge ft-status-scheduled">✈ Scheduled</span>`;
  }
  if (status === 'delayed') {
    return `<span class="ft-status-badge ft-status-delayed">⏱ Delayed</span>`;
  }
  if (status === 'cancelled') {
    return `<span class="ft-status-badge ft-status-cancelled">✕ Cancelled</span>`;
  }
  return '';
}
