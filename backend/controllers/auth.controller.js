const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const token = jwt.sign(
      { sub: admin._id.toString(), role: 'admin', username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    );
    res.json({ token, admin: { username: admin.username } });
  } catch (e) { next(e); }
}

module.exports = { login };
