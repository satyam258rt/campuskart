const paymentService = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');

class PaymentController {
  async verifyPayment(req, res, next) {
    try {
      const result = await paymentService.verifyPaymentSignature(req.body);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const result = await paymentService.handleWebhook(signature, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
