const cartService = require('../services/cartService');
const ApiResponse = require('../utils/apiResponse');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user._id);
      return ApiResponse.success(res, { cart }, 'Cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await cartService.addItem(req.user._id, req.body);
      return ApiResponse.success(res, { cart }, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(req.user._id, req.params.itemId, quantity);
      return ApiResponse.success(res, { cart }, 'Cart item updated');
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const cart = await cartService.removeItem(req.user._id, req.params.itemId);
      return ApiResponse.success(res, { cart }, 'Item removed from cart');
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const result = await cartService.clearCart(req.user._id);
      return ApiResponse.success(res, result, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
