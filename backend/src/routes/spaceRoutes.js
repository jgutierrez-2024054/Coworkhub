const router = require('express').Router();
const spaceController = require('../controllers/spaceController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { spaceSchema, spaceUpdateSchema } = require('../schemas/spaceSchemas');

router.get('/', authenticate, spaceController.list);
router.get('/available', authenticate, spaceController.listAvailable);
router.post('/', authenticate, authorize('admin'), validate(spaceSchema), spaceController.create);
router.patch('/:id', authenticate, authorize('admin'), validate(spaceUpdateSchema), spaceController.update);
router.delete('/:id', authenticate, authorize('admin'), spaceController.deactivate);

module.exports = router;
