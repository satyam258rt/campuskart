const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public: Get resource reviews
router.get('/resource/:resourceId', (req, res, next) =>
  reviewController.getResourceReviews(req, res, next)
);

// Protected: Post review
router.post('/', protect, (req, res, next) =>
  reviewController.createReview(req, res, next)
);

// Admin: Moderate review
router.patch(
  '/:id/moderate',
  protect,
  authorize('admin', 'super_admin'),
  (req, res, next) => reviewController.moderateReview(req, res, next)
);

module.exports = router;
