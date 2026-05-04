const mongoose = require('mongoose');
const { generateId } = require('../utils/generateId');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ticketSchema = new mongoose.Schema({
  ticket_id: { type: String, unique: true, default: () => generateId('TK') },
  passenger_name: { type: String, required: true, trim: true },
  passenger_surname: { type: String, required: true, trim: true },
  passenger_email: {
    type: String, required: true, trim: true, lowercase: true,
    validate: { validator: (v) => emailRegex.test(v), message: 'Invalid email' },
  },
  flight_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  seat_number: { type: String, required: true },
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'paid' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

module.exports = mongoose.model('Ticket', ticketSchema);
