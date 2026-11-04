const reviewService = require('../services/reviewService');
const ApiResponse = require('../utils/apiResponse');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user._id, req.body);
      return ApiResponse.created(res, { review }, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getResourceReviews(req, res, next) {
    try {
      const result = await reviewService.getResourceReviews(req.params.resourceId, req.query);
      return ApiResponse.paginated(res, {
        data: result.reviews,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Reviews retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateReview(req, res, next) {
    try {
      const { status } = req.body;
      const review = await reviewService.moderateReview(req.params.id, status);
      return ApiResponse.success(res, { review }, `Review status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
