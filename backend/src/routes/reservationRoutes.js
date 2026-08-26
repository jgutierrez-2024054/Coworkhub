const router = require('express').Router();
const reservationController = require('../controllers/reservationController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createReservationSchema } = require('../schemas/reservationSchemas');

router.get('/mine', authenticate, authorize('member', 'admin'), reservationController.mine);
router.post('/', authenticate, authorize('member', 'admin'), validate(createReservationSchema), reservationController.create);
router.post('/:id/cancel', authenticate, authorize('member', 'admin'), reservationController.cancel);

module.exports = router;
