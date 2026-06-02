const router = require('express').Router();
const { getStats } = require('../controllers/adminStats.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/stats', requireAdmin, getStats);

module.exports = router;
