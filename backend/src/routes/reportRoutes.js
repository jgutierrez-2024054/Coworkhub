const router = require('express').Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// El admin puede ver el consumo de cualquiera; un miembro solo el propio
// (el controller valida memberId === req.user.id cuando el rol es "member").
router.get('/consumo', authenticate, authorize('admin', 'member'), reportController.consumo);
router.get('/reservations', authenticate, authorize('admin'), reportController.reservations);

module.exports = router;
