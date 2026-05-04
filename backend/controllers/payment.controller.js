const { generateId } = require('../utils/generateId');

function luhn(num) {
  const s = String(num).replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0, alt = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

async function simulate(req, res, next) {
  try {
    const { amount, cardNumber, expiry, cvv } = req.body || {};
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: { message: 'Invalid amount' } });
    }
    if (!luhn(cardNumber)) {
      return res.status(400).json({ error: { message: 'Invalid card number' } });
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(expiry || ''))) {
      return res.status(400).json({ error: { message: 'Invalid expiry (MM/YY)' } });
    }
    if (!/^\d{3,4}$/.test(String(cvv || ''))) {
      return res.status(400).json({ error: { message: 'Invalid CVV' } });
    }
    await new Promise((r) => setTimeout(r, 1500));
    res.json({ success: true, transactionId: generateId('TX'), amount });
  } catch (e) { next(e); }
}

module.exports = { simulate };
