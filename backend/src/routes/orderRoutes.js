const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', (req, res, next) => orderController.checkout(req, res, next));
router.get('/my-orders', (req, res, next) => orderController.getMyOrders(req, res, next));
router.get('/seller-orders', (req, res, next) => orderController.getSellerOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));
router.put('/:id/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));

module.exports = router;
