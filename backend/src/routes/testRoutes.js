const router = require('express').Router();
const testController = require('../controllers/testController');

router.post('/seed', testController.seed);

module.exports = router;
