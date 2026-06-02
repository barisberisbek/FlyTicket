const mongoose = require('mongoose');
const { generateId } = require('../utils/generateId');

function detectCardType(lastFour, firstDigit) {
  if (!firstDigit) return 'other';
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '5') return 'mastercard';
  if (firstDigit === '3') return 'amex';
  return 'other';
}

const savedCardSchema = new mongoose.Schema({
  card_id:   { type: String, unique: true, default: () => generateId('CC') },
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label:     { type: String, default: 'My Card', trim: true },
  last_four: { type: String, required: true, match: /^\d{4}$/ },
  expiry:    { type: String, required: true },
  card_type: { type: String, enum: ['visa', 'mastercard', 'amex', 'other'], default: 'other' },
  is_default:{ type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

savedCardSchema.statics.detectType = detectCardType;

module.exports = mongoose.model('SavedCard', savedCardSchema);
