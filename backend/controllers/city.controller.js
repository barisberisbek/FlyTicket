const City = require('../models/City');

async function list(req, res, next) {
  try {
    const cities = await City.find().sort({ city_id: 1 });
    res.json({ cities });
  } catch (e) { next(e); }
}

module.exports = { list };
