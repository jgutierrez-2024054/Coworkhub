const router = require('express').Router();
const memberController = require('../controllers/memberController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { assignPlanSchema } = require('../schemas/memberSchemas');

// Rutas específicas primero (sin parámetros dinámicos)
router.post('/me/plan', authenticate, validate(assignPlanSchema), memberController.selectMyPlan);

// Rutas con parámetros dinámicos después
router.get('/', authenticate, authorize('admin'), memberController.list);
router.get('/:id', authenticate, authorize('admin'), memberController.detail);
router.patch('/:id/plan', authenticate, authorize('admin'), validate(assignPlanSchema), memberController.assignPlan);

module.exports = router;
