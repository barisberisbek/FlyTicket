module.exports = function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || (err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500);

  let message = err.message || 'Internal server error';
  let details;

  if (err.code === 11000) {
    message = 'Duplicate value';
    details = err.keyValue;
  }
  if (err.name === 'ValidationError' && err.errors) {
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: { message, ...(details ? { details } : {}) } });
};
