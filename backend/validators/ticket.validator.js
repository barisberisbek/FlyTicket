const { body, validationResult } = require('express-validator');

const ticketCreate = [
  body('flight_id').isMongoId().withMessage('flight_id must be a valid id'),
  body('passenger_name').isString().trim().notEmpty().withMessage('passenger_name required'),
  body('passenger_surname').isString().trim().notEmpty().withMessage('passenger_surname required'),
  body('passenger_email').isEmail().withMessage('valid email required'),
  body('seat_number').isString().trim().notEmpty().withMessage('seat_number required'),
];

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = Object.fromEntries(errors.array().map((e) => [e.path || e.param, e.msg]));
  return res.status(400).json({ error: { message: 'Validation failed', details } });
}

module.exports = { ticketCreate, runValidation };
