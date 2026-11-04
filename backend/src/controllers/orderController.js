const orderService = require('../services/orderService');
const ApiResponse = require('../utils/apiResponse');

class OrderController {
  async checkout(req, res, next) {
    try {
      const result = await orderService.checkout(req.user._id, req.body);
      return ApiResponse.created(res, result, 'Order staged. Complete payment to confirm.');
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const result = await orderService.getMyOrders(req.user._id, req.query);
      return ApiResponse.paginated(res, {
        data: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Your orders retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getSellerOrders(req, res, next) {
    try {
      const result = await orderService.getSellerOrders(req.user._id, req.query);
      return ApiResponse.paginated(res, {
        data: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Seller orders retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.roles);
      return ApiResponse.success(res, { order }, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user._id, req.body.reason);
      return ApiResponse.success(res, { order }, 'Order cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
