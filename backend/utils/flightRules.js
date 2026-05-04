const City = require('../models/City');
const Flight = require('../models/Flight');

class ConflictError extends Error {
  constructor(message) { super(message); this.name = 'ConflictError'; this.status = 409; }
}
class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; this.status = 400; }
}

function hourRange(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

function fmtHour(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

async function validateFlightRules(payload, { excludeId } = {}) {
  const { from_city, to_city, departure_time, arrival_time } = payload;

  if (!from_city || !to_city) throw new ValidationError('from_city and to_city are required');
  if (String(from_city) === String(to_city)) throw new ValidationError('from_city and to_city must differ');
  if (!departure_time || !arrival_time) throw new ValidationError('departure_time and arrival_time are required');

  const dep = new Date(departure_time);
  const arr = new Date(arrival_time);
  if (Number.isNaN(dep.getTime()) || Number.isNaN(arr.getTime())) throw new ValidationError('Invalid date(s)');
  if (arr <= dep) throw new ValidationError('arrival_time must be after departure_time');

  const [fromCity, toCity] = await Promise.all([City.findById(from_city), City.findById(to_city)]);
  if (!fromCity) throw new ValidationError('from_city does not exist');
  if (!toCity)   throw new ValidationError('to_city does not exist');

  const depRange = hourRange(dep);
  const arrRange = hourRange(arr);
  const baseFilter = excludeId ? { _id: { $ne: excludeId } } : {};

  const depConflict = await Flight.findOne({
    ...baseFilter,
    from_city,
    departure_time: { $gte: depRange.start, $lt: depRange.end },
  });
  if (depConflict) {
    throw new ConflictError(`Conflict: a flight already departs from ${fromCity.city_name} at ${fmtHour(dep)}.`);
  }

  const arrConflict = await Flight.findOne({
    ...baseFilter,
    to_city,
    arrival_time: { $gte: arrRange.start, $lt: arrRange.end },
  });
  if (arrConflict) {
    throw new ConflictError(`Conflict: a flight already arrives in ${toCity.city_name} at ${fmtHour(arr)}.`);
  }

  return { fromCity, toCity };
}

module.exports = { validateFlightRules, ConflictError, ValidationError };
