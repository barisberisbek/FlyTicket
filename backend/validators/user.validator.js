const { body, validationResult } = require('express-validator');

const register = [
  body('name').isString().trim().notEmpty(),
  body('surname').isString().trim().notEmpty(),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
];

const login = [
  body('email').isEmail(),
  body('password').isString().notEmpty(),
];

const adminLogin = [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
];

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = Object.fromEntries(errors.array().map((e) => [e.path || e.param, e.msg]));
  return res.status(400).json({ error: { message: 'Validation failed', details } });
}

module.exports = { register, login, adminLogin, runValidation };
