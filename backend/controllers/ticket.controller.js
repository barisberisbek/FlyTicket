const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const { sendETicket } = require('../services/mailService');
const { generateId } = require('../utils/generateId');
const { calcRefund } = require('../utils/cancellationPolicy');

const POPULATE_FLIGHT = { path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] };

async function bookSeat(flightId, seatNumber) {
  return Flight.findOneAndUpdate(
    { _id: flightId, seats_available: { $gt: 0 }, booked_seats: { $ne: seatNumber } },
    { $inc: { seats_available: -1 }, $push: { booked_seats: seatNumber } },
    { new: true },
  ).populate('from_city', 'city_id city_name').populate('to_city', 'city_id city_name');
}

async function create(req, res, next) {
  try {
    const { flight_id, passenger_name, passenger_surname, passenger_email, seat_number, seats } = req.body;

    // Multi-seat booking (seats array) — supports N passengers with same passenger info
    if (Array.isArray(seats) && seats.length > 1) {
      const booking_ref = generateId('BK');
      const userId = req.user?.role === 'user' ? req.user.sub : null;
      const createdTickets = [];
      let lastFlight = null;

      for (const seat of seats) {
        const updated = await bookSeat(flight_id, seat);
        if (!updated) {
          const exists = await Flight.findById(flight_id);
          if (!exists) return res.status(404).json({ error: { message: 'Flight not found' } });
          if (exists.booked_seats.includes(seat)) {
            return res.status(409).json({ error: { message: `Seat ${seat} is already taken.` } });
          }
          return res.status(409).json({ error: { message: 'Flight is sold out.' } });
        }
        lastFlight = updated;
        const ticket = await Ticket.create({
          passenger_name, passenger_surname, passenger_email,
          flight_id: updated._id, seat_number: seat,
          payment_status: 'paid', booking_ref, user_id: userId,
        });
        createdTickets.push(ticket);
      }
      for (const t of createdTickets) {
        sendETicket(t, lastFlight).catch((e) => console.error('[mail]', e.message));
      }
      return res.status(201).json({ tickets: createdTickets, booking_ref, flight: lastFlight });
    }

    // Single seat booking
    const seatNum = seat_number || (Array.isArray(seats) ? seats[0] : null);
    if (!seatNum) return res.status(400).json({ error: { message: 'seat_number required' } });

    const updated = await bookSeat(flight_id, seatNum);
    if (!updated) {
      const exists = await Flight.findById(flight_id);
      if (!exists) return res.status(404).json({ error: { message: 'Flight not found' } });
      if (exists.booked_seats.includes(seatNum)) {
        return res.status(409).json({ error: { message: `Seat ${seatNum} is already taken.` } });
      }
      return res.status(409).json({ error: { message: 'Flight is sold out.' } });
    }

    const userId = req.user?.role === 'user' ? req.user.sub : null;
    const ticket = await Ticket.create({
      passenger_name, passenger_surname, passenger_email,
      flight_id: updated._id, seat_number: seatNum,
      payment_status: 'paid', user_id: userId,
    });
    sendETicket(ticket, updated).catch((e) => console.error('[mail] async send failed:', e.message));
    res.status(201).json({ ticket, flight: updated });
  } catch (e) { next(e); }
}

async function cancel(req, res, next) {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.ticketId })
      .populate({ path: 'flight_id', populate: [{ path: 'from_city' }, { path: 'to_city' }] });
    if (!ticket) return res.status(404).json({ error: { message: 'Ticket not found' } });
    if (String(ticket.user_id) !== String(req.user.sub)) {
      return res.status(403).json({ error: { message: 'Not your ticket' } });
    }
    if (ticket.status === 'cancelled') {
      return res.status(409).json({ error: { message: 'Ticket is already cancelled' } });
    }
    const flight = ticket.flight_id;
    const policy = calcRefund(flight.departure_time, flight.price);
    if (policy.blocked) {
      return res.status(409).json({ error: { message: policy.reason } });
    }
    await Flight.findByIdAndUpdate(flight._id, {
      $inc: { seats_available: 1 },
      $pull: { booked_seats: ticket.seat_number },
    });
    ticket.status = 'cancelled';
    ticket.cancelled_at = new Date();
    await ticket.save();
    res.json({ ticket, refundAmount: policy.refundAmount, refundRate: policy.rate, reason: policy.reason });
  } catch (e) { next(e); }
}

async function listByEmail(req, res, next) {
  try {
    const email = String(req.params.email || '').toLowerCase();
    const tickets = await Ticket.find({ passenger_email: email })
      .populate(POPULATE_FLIGHT).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

async function listAll(req, res, next) {
  try {
    const tickets = await Ticket.find()
      .populate(POPULATE_FLIGHT).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.ticketId })
      .populate(POPULATE_FLIGHT);
    if (!ticket) return res.status(404).json({ error: { message: 'Ticket not found' } });
    res.json({ ticket });
  } catch (e) { next(e); }
}

async function listMine(req, res, next) {
  try {
    if (req.user?.role !== 'user') return res.status(403).json({ error: { message: 'User token required' } });
    const tickets = await Ticket.find({ user_id: req.user.sub })
      .populate(POPULATE_FLIGHT).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (e) { next(e); }
}

module.exports = { create, cancel, listByEmail, listAll, getById, listMine };
