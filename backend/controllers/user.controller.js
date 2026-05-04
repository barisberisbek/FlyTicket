const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: 'user', email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

async function register(req, res, next) {
  try {
    const { name, surname, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: { message: 'Email already registered' } });
    const user = await User.create({ name, surname, email, password });
    res.status(201).json({ token: signToken(user), user });
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    res.json({ token: signToken(user), user });
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    if (req.user?.role !== 'user') return res.status(403).json({ error: { message: 'User token required' } });
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json({ user });
  } catch (e) { next(e); }
}

module.exports = { register, login, me };
