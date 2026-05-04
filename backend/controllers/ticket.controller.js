const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const { sendETicket } = require('../services/mailService');

async function create(req, res, next) {
  try {
    const { flight_id, passenger_name, passenger_surname, passenger_email, seat_number } = req.body;

    const updated = await Flight.findOneAndUpdate(
      { _id: flight_id, seats_available: { $gt: 0 }, booked_seats: { $ne: seat_number } },
      { $inc: { seats_available: -1 }, $push: { booked_seats: seat_number } },
      { new: true },
    ).populate('from_city', 'city_id city_name').populate('to_city', 'city_id city_name');

    if (!updated) {
      const exists = await Flight.findById(flight_id);
      if (!exists) return res.status(404).json({ error: { message: 'Flight not found' } });
      if (exists.booked_seats.includes(seat_number)) {
        return res.status(409).json({ error: { message: `Seat ${seat_number} is already taken.` } });
      }
      return res.status(409).json({ error: { message: 'Flight is sold out.' } });
    }

    const userId = req.user?.role === 'user' ? req.user.sub : null;

    const ticket = await Ticket.create({
      passenger_name,
      passenger_surname,
      passenger_email,
      flight_id: updated._id,
      seat_number,
      payment_status: 'paid',
      user_id: userId,
    });

    sendETicket(ticket, updated).catch((e) => console.error('[mail] async send failed:', e.message));

    res.status(201).json({ ticket, flight: updated });
  } catch (e) { next(e); }
}

async function listByEmail(req, res, next) {
  try {
    const email = String(req.params.email || '').toLowerCase();
    const tickets = await Ticket.find({ passenger_email: email })
      .populate({ path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] })
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

async function listAll(req, res, next) {
  try {
    const tickets = await Ticket.find()
      .populate({ path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] })
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.ticketId })
      .populate({ path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] });
    if (!ticket) return res.status(404).json({ error: { message: 'Ticket not found' } });
    res.json({ ticket });
  } catch (e) { next(e); }
}

async function listMine(req, res, next) {
  try {
    if (req.user?.role !== 'user') return res.status(403).json({ error: { message: 'User token required' } });
    const tickets = await Ticket.find({ user_id: req.user.sub })
      .populate({ path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] })
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

module.exports = { create, listByEmail, listAll, getById, listMine };
