const router = require('express').Router();
const planController = require('../controllers/planController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { planSchema, planUpdateSchema } = require('../schemas/planSchemas');

router.get('/', planController.list); // Público: cualquier usuario puede ver planes
router.post('/', authenticate, authorize('admin'), validate(planSchema), planController.create);
router.patch('/:id', authenticate, authorize('admin'), validate(planUpdateSchema), planController.update);

module.exports = router;
