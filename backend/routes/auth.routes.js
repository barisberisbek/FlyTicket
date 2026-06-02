const router = require('express').Router();
const { login, changeAdminPassword } = require('../controllers/auth.controller');
const { adminLogin, runValidation } = require('../validators/user.validator');
const { requireAdmin } = require('../middleware/auth.middleware');

router.post('/login', adminLogin, runValidation, login);
router.put('/password', requireAdmin, changeAdminPassword);

module.exports = router;
