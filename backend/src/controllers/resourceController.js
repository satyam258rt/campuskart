const resourceService = require('../services/resourceService');
const ApiResponse = require('../utils/apiResponse');

class ResourceController {
  async getResources(req, res, next) {
    try {
      const result = await resourceService.getResources(req.query);
      return ApiResponse.paginated(res, {
        data: result.resources,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Resources retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getResourceById(req, res, next) {
    try {
      const resource = await resourceService.getResourceById(req.params.id, true);
      return ApiResponse.success(res, { resource }, 'Resource retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyListings(req, res, next) {
    try {
      const result = await resourceService.getMyListings(req.user._id, req.query);
      return ApiResponse.paginated(res, {
        data: result.resources,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Your listings retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async createResource(req, res, next) {
    try {
      const resource = await resourceService.createResource(req.user._id, req.body);
      return ApiResponse.created(
        res,
        { resource },
        'Listing created successfully! It will be publicly visible once approved by an administrator.'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateResource(req, res, next) {
    try {
      const resource = await resourceService.updateResource(
        req.params.id,
        req.user._id,
        req.body,
        req.user.roles
      );
      return ApiResponse.success(res, { resource }, 'Listing updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async togglePauseResource(req, res, next) {
    try {
      const resource = await resourceService.togglePauseResource(req.params.id, req.user._id);
      return ApiResponse.success(
        res,
        { resource },
        `Listing is now ${resource.status.toLowerCase()}`
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteResource(req, res, next) {
    try {
      const result = await resourceService.deleteResource(
        req.params.id,
        req.user._id,
        req.user.roles
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async approveResource(req, res, next) {
    try {
      const resource = await resourceService.approveResource(req.params.id, req.user._id);
      return ApiResponse.success(res, { resource }, 'Listing approved and is now active');
    } catch (error) {
      next(error);
    }
  }

  async rejectResource(req, res, next) {
    try {
      const resource = await resourceService.rejectResource(
        req.params.id,
        req.user._id,
        req.body.reason
      );
      return ApiResponse.success(res, { resource }, 'Listing rejected');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResourceController();
