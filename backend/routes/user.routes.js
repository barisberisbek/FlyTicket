const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const v = require('../validators/user.validator');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register', v.register, v.runValidation, ctrl.register);
router.post('/login', v.login, v.runValidation, ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.put('/me', requireAuth, ctrl.updateProfile);
router.put('/me/password', requireAuth, ctrl.changePassword);

module.exports = router;
