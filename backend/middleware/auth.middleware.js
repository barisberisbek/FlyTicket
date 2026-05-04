const jwt = require('jsonwebtoken');

function extractToken(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: { message: 'Authentication required' } });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin privileges required' } });
    }
    next();
  });
}

function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* ignore */ }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
