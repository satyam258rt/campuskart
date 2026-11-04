const express = require('express');
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  createResourceSchema,
  updateResourceSchema,
  rejectResourceSchema
} = require('../validators/resourceValidator');

const router = express.Router();

// Public routes
router.get('/', (req, res, next) => resourceController.getResources(req, res, next));

// Authenticated user listings management
router.get('/user/my-listings', protect, (req, res, next) =>
  resourceController.getMyListings(req, res, next)
);

// Get single resource (Public)
router.get('/:id', (req, res, next) =>
  resourceController.getResourceById(req, res, next)
);

// Create new listing (Protected)
router.post(
  '/',
  protect,
  validate(createResourceSchema),
  (req, res, next) => resourceController.createResource(req, res, next)
);

// Update listing (Protected - Owner or Admin)
router.put(
  '/:id',
  protect,
  validate(updateResourceSchema),
  (req, res, next) => resourceController.updateResource(req, res, next)
);

// Pause or Resume listing (Protected - Owner)
router.patch(
  '/:id/toggle-pause',
  protect,
  (req, res, next) => resourceController.togglePauseResource(req, res, next)
);

// Delete listing (Protected - Owner or Admin)
router.delete(
  '/:id',
  protect,
  (req, res, next) => resourceController.deleteResource(req, res, next)
);

// Admin Moderation: Approve listing
router.put(
  '/:id/approve',
  protect,
  authorize('admin', 'super_admin'),
  (req, res, next) => resourceController.approveResource(req, res, next)
);

// Admin Moderation: Reject listing
router.put(
  '/:id/reject',
  protect,
  authorize('admin', 'super_admin'),
  validate(rejectResourceSchema),
  (req, res, next) => resourceController.rejectResource(req, res, next)
);

module.exports = router;
