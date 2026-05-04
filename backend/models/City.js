const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  city_id: { type: String, required: true, unique: true, trim: true },
  city_name: { type: String, required: true, unique: true, trim: true },
}, { timestamps: false });

module.exports = mongoose.model('City', citySchema);
