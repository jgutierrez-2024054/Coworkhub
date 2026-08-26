const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const authController = require('../controllers/authController');

// Ruta de prueba simple en el router
router.get('/test-router', (req, res) => res.json({ message: 'Router test works' }));

router.use('/auth', require('./authRoutes'));
router.use('/plans', require('./planRoutes'));
router.use('/spaces', require('./spaceRoutes'));
router.use('/members', require('./memberRoutes'));
router.use('/reservations', require('./reservationRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/test', require('./testRoutes'));

// GET /me tal cual lo pide el contrato de endpoints minimos
router.get('/me', authenticate, authController.me);

module.exports = router;
