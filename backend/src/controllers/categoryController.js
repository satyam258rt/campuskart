const resourceService = require('../services/resourceService');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  async getCategories(req, res, next) {
    try {
      await resourceService.seedDefaultCategories();
      const categories = await resourceService.getCategories();
      return ApiResponse.success(res, { categories }, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await resourceService.createCategory(req.body);
      return ApiResponse.created(res, { category }, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
