const router = require('express').Router();
const ctrl = require('../controllers/ticket.controller');
const v = require('../validators/ticket.validator');
const { requireAdmin, requireAuth, optionalAuth } = require('../middleware/auth.middleware');

router.post('/', optionalAuth, v.ticketCreate, v.runValidation, ctrl.create);
router.get('/mine', requireAuth, ctrl.listMine);
router.get('/id/:ticketId', ctrl.getById);
router.get('/', requireAdmin, ctrl.listAll);
router.get('/:email', ctrl.listByEmail);

module.exports = router;
