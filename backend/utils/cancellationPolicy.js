function calcRefund(departureTime, price) {
  const hoursLeft = (new Date(departureTime) - Date.now()) / 3_600_000;
  if (hoursLeft < 0)  return { rate: 0, refundAmount: 0, blocked: true,  reason: 'Flight has already departed.' };
  if (hoursLeft < 12) return { rate: 0, refundAmount: 0, blocked: false, reason: 'Less than 12 hours to departure — no refund.' };
  if (hoursLeft < 24) return { rate: 0.5, refundAmount: +(price * 0.5).toFixed(2), blocked: false, reason: '12–24 hours to departure — 50% refund.' };
  if (hoursLeft < 48) return { rate: 0.75, refundAmount: +(price * 0.75).toFixed(2), blocked: false, reason: '24–48 hours to departure — 75% refund.' };
  return { rate: 1, refundAmount: +price, blocked: false, reason: 'More than 48 hours to departure — full refund.' };
}

module.exports = { calcRefund };
