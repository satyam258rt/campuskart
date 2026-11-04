const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', (req, res, next) => cartController.getCart(req, res, next));
router.post('/items', (req, res, next) => cartController.addItem(req, res, next));
router.put('/items/:itemId', (req, res, next) => cartController.updateItem(req, res, next));
router.delete('/items/:itemId', (req, res, next) => cartController.removeItem(req, res, next));
router.delete('/clear', (req, res, next) => cartController.clearCart(req, res, next));

module.exports = router;
