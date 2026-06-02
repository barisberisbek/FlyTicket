const SavedCard = require('../models/SavedCard');

function getCardType(firstDigit) {
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '5') return 'mastercard';
  if (firstDigit === '3') return 'amex';
  return 'other';
}

async function listCards(req, res, next) {
  try {
    const cards = await SavedCard.find({ user_id: req.user.sub }).sort({ createdAt: -1 });
    res.json({ cards });
  } catch (e) { next(e); }
}

async function saveCard(req, res, next) {
  try {
    const { lastFour, expiry, firstDigit, label } = req.body;
    if (!lastFour || !/^\d{4}$/.test(lastFour)) {
      return res.status(400).json({ error: { message: 'lastFour must be 4 digits' } });
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return res.status(400).json({ error: { message: 'expiry must be MM/YY' } });
    }
    const card = await SavedCard.create({
      user_id: req.user.sub,
      label: label?.trim() || 'My Card',
      last_four: lastFour,
      expiry,
      card_type: getCardType(firstDigit || ''),
    });
    res.status(201).json({ card });
  } catch (e) { next(e); }
}

async function deleteCard(req, res, next) {
  try {
    const card = await SavedCard.findOne({ card_id: req.params.cardId });
    if (!card) return res.status(404).json({ error: { message: 'Card not found' } });
    if (String(card.user_id) !== String(req.user.sub)) {
      return res.status(403).json({ error: { message: 'Not your card' } });
    }
    await card.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { listCards, saveCard, deleteCard };
