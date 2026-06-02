const mongoose = require('mongoose');
const { generateId } = require('../utils/generateId');

const flightSchema = new mongoose.Schema({
  flight_id: { type: String, unique: true, default: () => generateId('FL') },
  from_city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  to_city:   { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  departure_time: { type: Date, required: true },
  arrival_time:   { type: Date, required: true },
  price: { type: Number, required: true, min: 0 },
  seats_total: { type: Number, required: true, min: 1 },
  seats_available: { type: Number, required: true, min: 0 },
  booked_seats: { type: [String], default: [] },
  status: { type: String, enum: ['scheduled', 'delayed', 'cancelled'], default: 'scheduled' },
}, { timestamps: true });

flightSchema.pre('validate', function (next) {
  if (this.from_city && this.to_city && String(this.from_city) === String(this.to_city)) {
    return next(new Error('from_city and to_city must differ'));
  }
  if (this.departure_time && this.arrival_time && this.arrival_time <= this.departure_time) {
    return next(new Error('arrival_time must be after departure_time'));
  }
  if (this.seats_available > this.seats_total) {
    return next(new Error('seats_available cannot exceed seats_total'));
  }
  next();
});

module.exports = mongoose.model('Flight', flightSchema);
