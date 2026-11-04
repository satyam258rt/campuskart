const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createCategorySchema } = require('../validators/categoryValidator');

const router = express.Router();

// Public: Get all active categories
router.get('/', (req, res, next) => categoryController.getCategories(req, res, next));

// Admin: Create new category
router.post(
  '/',
  protect,
  authorize('admin', 'super_admin'),
  validate(createCategorySchema),
  (req, res, next) => categoryController.createCategory(req, res, next)
);

module.exports = router;
