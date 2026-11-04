const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Webhook endpoint (unprotected, verified via crypto signature)
router.post('/webhook', (req, res, next) => paymentController.handleWebhook(req, res, next));

// Verify Razorpay payment signature
router.post('/verify', protect, (req, res, next) =>
  paymentController.verifyPayment(req, res, next)
);

module.exports = router;
