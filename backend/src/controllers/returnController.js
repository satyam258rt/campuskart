const returnService = require('../services/returnService');
const ApiResponse = require('../utils/apiResponse');

class ReturnController {
  async requestReturn(req, res, next) {
    try {
      const returnDoc = await returnService.requestReturn(req.user._id, req.body);
      return ApiResponse.created(res, { returnDoc }, 'Return request submitted to lessor');
    } catch (error) {
      next(error);
    }
  }

  async inspectReturn(req, res, next) {
    try {
      const returnDoc = await returnService.inspectReturn(req.params.id, req.user._id, req.body);
      return ApiResponse.success(res, { returnDoc }, 'Inspection completed and deductions calculated');
    } catch (error) {
      next(error);
    }
  }

  async settleDeposit(req, res, next) {
    try {
      const result = await returnService.settleDeposit(req.params.id, req.user._id);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getMyReturns(req, res, next) {
    try {
      const returns = await returnService.getReturns(req.user._id, 'renter');
      return ApiResponse.success(res, { returns }, 'Your returns retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getLessorReturns(req, res, next) {
    try {
      const returns = await returnService.getReturns(req.user._id, 'lessor');
      return ApiResponse.success(res, { returns }, 'Lessor return requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getReturnById(req, res, next) {
    try {
      const returnDoc = await returnService.getReturnById(req.params.id, req.user._id);
      return ApiResponse.success(res, { returnDoc }, 'Return details retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReturnController();
