const router = require('express').Router();
const { list } = require('../controllers/city.controller');
router.get('/', list);
module.exports = router;
