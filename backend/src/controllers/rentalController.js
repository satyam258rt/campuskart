const rentalService = require('../services/rentalService');
const ApiResponse = require('../utils/apiResponse');

class RentalController {
  async checkAvailability(req, res, next) {
    try {
      const { resourceId, startDate, endDate } = req.body;
      const result = await rentalService.checkAvailability(resourceId, startDate, endDate);
      return ApiResponse.success(res, result, result.isAvailable ? 'Resource is available for these dates' : 'Resource is already booked');
    } catch (error) {
      next(error);
    }
  }

  async createRental(req, res, next) {
    try {
      const rental = await rentalService.createRental(req.user._id, req.body);
      return ApiResponse.created(res, { rental }, 'Rental reserved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyRentals(req, res, next) {
    try {
      const result = await rentalService.getUserRentals(req.user._id, 'renter', req.query);
      return ApiResponse.paginated(res, {
        data: result.rentals,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Your rentals retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getLessorRentals(req, res, next) {
    try {
      const result = await rentalService.getUserRentals(req.user._id, 'lessor', req.query);
      return ApiResponse.paginated(res, {
        data: result.rentals,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Lessor rentals retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getRentalById(req, res, next) {
    try {
      const rental = await rentalService.getRentalById(req.params.id, req.user._id);
      return ApiResponse.success(res, { rental }, 'Rental details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async activateRental(req, res, next) {
    try {
      const rental = await rentalService.activateRental(req.params.id, req.user._id);
      return ApiResponse.success(res, { rental }, 'Rental marked as active');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RentalController();
