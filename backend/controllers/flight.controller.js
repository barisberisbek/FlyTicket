const Flight = require('../models/Flight');
const { validateFlightRules } = require('../utils/flightRules');

async function list(req, res, next) {
  try {
    const { from, to, date } = req.query;
    const filter = {};
    if (from) filter.from_city = from;
    if (to) filter.to_city = to;
    if (date) {
      const parts = String(date).split('-').map(Number);
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        const dayStart = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        filter.departure_time = { $gte: dayStart, $lt: dayEnd };
      }
    }
    const flights = await Flight.find(filter)
      .populate('from_city', 'city_id city_name')
      .populate('to_city', 'city_id city_name')
      .sort({ departure_time: 1 });
    res.json({ flights });
  } catch (e) { next(e); }
}

async function getOne(req, res, next) {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('from_city', 'city_id city_name')
      .populate('to_city', 'city_id city_name');
    if (!flight) return res.status(404).json({ error: { message: 'Flight not found' } });
    res.json({ flight });
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const { from_city, to_city, departure_time, arrival_time, price, seats_total } = req.body;
    await validateFlightRules({ from_city, to_city, departure_time, arrival_time });
    const flight = await Flight.create({
      from_city, to_city,
      departure_time, arrival_time,
      price, seats_total,
      seats_available: seats_total,
      booked_seats: [],
    });
    const populated = await Flight.findById(flight._id)
      .populate('from_city', 'city_id city_name')
      .populate('to_city', 'city_id city_name');
    res.status(201).json({ flight: populated });
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const existing = await Flight.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: { message: 'Flight not found' } });

    const next_payload = {
      from_city: req.body.from_city ?? existing.from_city,
      to_city: req.body.to_city ?? existing.to_city,
      departure_time: req.body.departure_time ?? existing.departure_time,
      arrival_time: req.body.arrival_time ?? existing.arrival_time,
    };
    await validateFlightRules(next_payload, { excludeId: existing._id });

    const fields = ['from_city', 'to_city', 'departure_time', 'arrival_time', 'price', 'seats_total'];
    for (const f of fields) if (req.body[f] !== undefined) existing[f] = req.body[f];

    if (req.body.seats_total !== undefined) {
      const booked = existing.booked_seats.length;
      if (req.body.seats_total < booked) {
        return res.status(400).json({ error: { message: `Cannot reduce seats below ${booked} already booked` } });
      }
      existing.seats_available = req.body.seats_total - booked;
    }

    await existing.save();
    const populated = await Flight.findById(existing._id)
      .populate('from_city', 'city_id city_name')
      .populate('to_city', 'city_id city_name');
    res.json({ flight: populated });
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ error: { message: 'Flight not found' } });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['scheduled', 'delayed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: { message: `status must be one of: ${allowed.join(', ')}` } });
    }
    const flight = await Flight.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('from_city', 'city_id city_name')
      .populate('to_city', 'city_id city_name');
    if (!flight) return res.status(404).json({ error: { message: 'Flight not found' } });
    res.json({ flight });
  } catch (e) { next(e); }
}

module.exports = { list, getOne, create, update, remove, updateStatus };
