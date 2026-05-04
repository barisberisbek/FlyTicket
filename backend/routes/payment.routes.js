const router = require('express').Router();
const { simulate } = require('../controllers/payment.controller');

router.post('/simulate', simulate);

module.exports = router;
