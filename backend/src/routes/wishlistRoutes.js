const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', (req, res, next) => wishlistController.getWishlist(req, res, next));
router.post('/toggle/:resourceId', (req, res, next) =>
  wishlistController.toggleWishlist(req, res, next)
);

module.exports = router;
