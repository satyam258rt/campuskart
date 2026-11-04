const Review = require('../models/Review');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Resource = require('../models/Resource');
const ApiError = require('../utils/apiError');

class ReviewService {
  /**
   * Add a review for a completed order or rental
   */
  async createReview(userId, data) {
    const { resourceId, rating, comment } = data;

    const resource = await Resource.findById(resourceId);
    if (!resource) throw ApiError.notFound('Resource not found');

    if (resource.owner.toString() === userId.toString()) {
      throw ApiError.badRequest('You cannot review your own resource');
    }

    // Verify user has a completed transaction (Order or Rental)
    const [completedOrder, completedRental] = await Promise.all([
      Order.findOne({
        buyer: userId,
        'items.resource': resourceId,
        paymentStatus: 'PAID'
      }),
      Rental.findOne({
        renter: userId,
        resource: resourceId,
        status: { $in: ['RETURNED', 'CLOSED'] }
      })
    ]);

    if (!completedOrder && !completedRental) {
      throw ApiError.badRequest('Only students with completed purchases or rentals can review this resource');
    }

    // Check if review already exists
    const existing = await Review.findOne({ user: userId, resource: resourceId });
    if (existing) {
      throw ApiError.conflict('You have already reviewed this resource');
    }

    const review = new Review({
      user: userId,
      resource: resourceId,
      seller: resource.owner,
      order: completedOrder?._id,
      rental: completedRental?._id,
      rating: Number(rating),
      comment: comment.trim(),
      status: 'APPROVED'
    });

    await review.save();
    return review.populate('user', 'name avatar campus');
  }

  /**
   * Get reviews for a resource
   */
  async getResourceReviews(resourceId, query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ resource: resourceId, status: 'APPROVED' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar campus'),
      Review.countDocuments({ resource: resourceId, status: 'APPROVED' })
    ]);

    return { reviews, total, page, limit };
  }

  /**
   * Admin moderate review
   */
  async moderateReview(reviewId, status) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );
    if (!review) throw ApiError.notFound('Review not found');
    return review;
  }
}

module.exports = new ReviewService();
