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

async function changeAdminPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: { message: 'currentPassword and newPassword required' } });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: { message: 'newPassword must be at least 6 characters' } });
    }
    const admin = await Admin.findById(req.user.sub);
    if (!admin) return res.status(404).json({ error: { message: 'Admin not found' } });
    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: { message: 'Current password is incorrect' } });
    admin.password = newPassword;
    await admin.save();
    res.json({ ok: true, message: 'Password updated successfully' });
  } catch (e) { next(e); }
}

module.exports = { login, changeAdminPassword };
