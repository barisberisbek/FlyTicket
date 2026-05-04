const { body, validationResult } = require('express-validator');

const flightCreate = [
  body('from_city').isMongoId().withMessage('from_city must be a valid id'),
  body('to_city').isMongoId().withMessage('to_city must be a valid id'),
  body('departure_time').isISO8601().withMessage('departure_time must be ISO date'),
  body('arrival_time').isISO8601().withMessage('arrival_time must be ISO date'),
  body('price').isFloat({ min: 0 }).withMessage('price must be >= 0'),
  body('seats_total').isInt({ min: 1 }).withMessage('seats_total must be >= 1'),
];

const flightUpdate = flightCreate.map((c) => c.optional());

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = Object.fromEntries(errors.array().map((e) => [e.path || e.param, e.msg]));
  return res.status(400).json({ error: { message: 'Validation failed', details } });
}

module.exports = { flightCreate, flightUpdate, runValidation };
