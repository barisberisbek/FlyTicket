const router = require('express').Router();
const { login } = require('../controllers/auth.controller');
const { adminLogin, runValidation } = require('../validators/user.validator');

router.post('/login', adminLogin, runValidation, login);

module.exports = router;
