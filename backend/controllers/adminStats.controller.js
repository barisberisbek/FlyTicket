const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');

async function getStats(req, res, next) {
  try {
    const now = new Date();
    const [flights, activeTickets, allTickets] = await Promise.all([
      Flight.find({}, 'seats_total seats_available status departure_time'),
      Ticket.find({ status: 'active' }).populate('flight_id', 'price'),
      Ticket.countDocuments(),
    ]);

    const totalFlights = flights.length;
    const upcomingFlights = flights.filter((f) => new Date(f.departure_time) > now).length;
    const cancelledFlights = flights.filter((f) => f.status === 'cancelled').length;
    const delayedFlights = flights.filter((f) => f.status === 'delayed').length;

    const totalBookings = allTickets;
    const activeBookings = activeTickets.length;

    const totalRevenue = activeTickets.reduce((sum, t) => {
      const price = t.flight_id?.price || 0;
      return sum + price;
    }, 0);

    const occupancyData = flights.map((f) => {
      const booked = f.seats_total - f.seats_available;
      return f.seats_total > 0 ? (booked / f.seats_total) * 100 : 0;
    });
    const avgOccupancy = occupancyData.length
      ? +(occupancyData.reduce((a, b) => a + b, 0) / occupancyData.length).toFixed(1)
      : 0;

    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const bookingsToday = await Ticket.countDocuments({ createdAt: { $gte: todayStart } });

    res.json({
      totalFlights, upcomingFlights, cancelledFlights, delayedFlights,
      totalBookings, activeBookings, bookingsToday,
      totalRevenue: +totalRevenue.toFixed(2),
      avgOccupancy,
    });
  } catch (e) { next(e); }
}

module.exports = { getStats };
