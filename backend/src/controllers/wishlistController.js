const wishlistService = require('../services/wishlistService');
const ApiResponse = require('../utils/apiResponse');

class WishlistController {
  async getWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.getWishlist(req.user._id);
      return ApiResponse.success(res, { wishlist }, 'Wishlist retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleWishlist(req, res, next) {
    try {
      const result = await wishlistService.toggleWishlist(req.user._id, req.params.resourceId);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();
