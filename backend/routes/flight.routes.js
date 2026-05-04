const router = require('express').Router();
const ctrl = require('../controllers/flight.controller');
const v = require('../validators/flight.validator');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', requireAdmin, v.flightCreate, v.runValidation, ctrl.create);
router.put('/:id', requireAdmin, v.flightUpdate, v.runValidation, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
