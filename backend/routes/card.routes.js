const router = require('express').Router();
const ctrl = require('../controllers/card.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, ctrl.listCards);
router.post('/', requireAuth, ctrl.saveCard);
router.delete('/:cardId', requireAuth, ctrl.deleteCard);

module.exports = router;
