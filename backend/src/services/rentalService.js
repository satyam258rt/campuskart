const Rental = require('../models/Rental');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');

class RentalService {
  /**
   * Check if a resource is available for the given date range (Strict Overlap Prevention)
   */
  async checkAvailability(resourceId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw ApiError.badRequest('Invalid start or end date provided');
    }

    if (start > end) {
      throw ApiError.badRequest('Rental start date must be before or equal to end date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      throw ApiError.badRequest('Rental start date cannot be in the past');
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    if (!['RENT', 'BOTH'].includes(resource.listingType)) {
      throw ApiError.badRequest('This resource is not available for rental');
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const minDays = resource.rentalPricing?.minDurationDays || 1;
    const maxDays = resource.rentalPricing?.maxDurationDays || 30;

    if (totalDays < minDays) {
      throw ApiError.badRequest(`Minimum rental duration for this item is ${minDays} day(s)`);
    }

    if (totalDays > maxDays) {
      throw ApiError.badRequest(`Maximum rental duration for this item is ${maxDays} day(s)`);
    }

    // Backend Overlap Query:
    // Any existing rental that overlaps: existing.startDate <= end AND existing.endDate >= start
    const conflictingRental = await Rental.findOne({
      resource: resourceId,
      status: { $in: ['RESERVED', 'ACTIVE', 'DUE', 'OVERDUE', 'RETURN_REQUESTED'] },
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    const isAvailable = !conflictingRental;

    const dailyRate = resource.rentalPricing?.pricePerDay || 0;
    const securityDeposit = resource.rentalPricing?.securityDeposit || 0;
    const rentalFee = dailyRate * totalDays;
    const totalAmount = rentalFee + securityDeposit;

    return {
      isAvailable,
      resourceId,
      startDate: start,
      endDate: end,
      totalDays,
      dailyRate,
      rentalFee,
      securityDeposit,
      totalAmount,
      conflict: conflictingRental
        ? {
            startDate: conflictingRental.startDate,
            endDate: conflictingRental.endDate,
            status: conflictingRental.status
          }
        : null
    };
  }

  /**
   * Create a rental reservation
   */
  async createRental(renterId, data) {
    const { resourceId, startDate, endDate } = data;

    // Check availability & overlap
    const check = await this.checkAvailability(resourceId, startDate, endDate);
    if (!check.isAvailable) {
      throw ApiError.conflict('The selected dates are already booked for this resource. Please pick different dates.');
    }

    const resource = await Resource.findById(resourceId);

    // Prevent renting one's own resource
    if (resource.owner.toString() === renterId.toString()) {
      throw ApiError.badRequest('You cannot rent your own resource');
    }

    const rental = new Rental({
      resource: resourceId,
      renter: renterId,
      owner: resource.owner,
      startDate: check.startDate,
      endDate: check.endDate,
      totalDays: check.totalDays,
      dailyRate: check.dailyRate,
      rentalFee: check.rentalFee,
      securityDeposit: check.securityDeposit,
      totalAmount: check.totalAmount,
      status: 'RESERVED'
    });

    await rental.save();

    // Notify Lessor
    await Notification.create({
      recipient: resource.owner,
      sender: renterId,
      type: 'NEW_ORDER',
      title: 'New Rental Reservation',
      message: `Your resource "${resource.title}" has been reserved for ${check.totalDays} day(s).`,
      link: `/rentals/${rental._id}`
    });

    return rental.populate([
      { path: 'resource', select: 'title images condition campus' },
      { path: 'owner', select: 'name email phone campus' },
      { path: 'renter', select: 'name email phone campus' }
    ]);
  }

  /**
   * Get user's rentals (as renter or as lessor)
   */
  async getUserRentals(userId, role = 'renter', query = {}) {
    const filter = role === 'lessor' ? { owner: userId } : { renter: userId };
    if (query.status) {
      filter.status = query.status;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
      Rental.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resource', 'title images condition campus')
        .populate('owner', 'name email phone campus')
        .populate('renter', 'name email phone campus'),
      Rental.countDocuments(filter)
    ]);

    return { rentals, total, page, limit };
  }

  /**
   * Get single rental details
   */
  async getRentalById(rentalId, userId) {
    const rental = await Rental.findById(rentalId).populate([
      { path: 'resource', select: 'title images condition campus rentalPricing' },
      { path: 'owner', select: 'name email phone campus reputationScore' },
      { path: 'renter', select: 'name email phone campus reputationScore' }
    ]);

    if (!rental) {
      throw ApiError.notFound('Rental record not found');
    }

    // Check authorization: must be renter, owner or admin
    const isParty =
      rental.renter._id.toString() === userId.toString() ||
      rental.owner._id.toString() === userId.toString();

    if (!isParty) {
      throw ApiError.forbidden('You do not have access to this rental record');
    }

    return rental;
  }

  /**
   * Activate rental (e.g. upon pickup/handover)
   */
  async activateRental(rentalId, userId) {
    const rental = await Rental.findById(rentalId);
    if (!rental) throw ApiError.notFound('Rental not found');

    if (rental.owner.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the lessor can mark the rental as handed over and active');
    }

    rental.status = 'ACTIVE';
    await rental.save();

    return rental;
  }
}

module.exports = new RentalService();
