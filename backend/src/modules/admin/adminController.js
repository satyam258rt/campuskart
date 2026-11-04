const adminService = require('./adminService');
const ApiResponse = require('../../utils/apiResponse');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return ApiResponse.success(res, stats, 'Dashboard statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await adminService.getUsers(req.query);
      return ApiResponse.paginated(res, {
        data: result.users,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await adminService.updateUserStatus(
        req.user._id,
        req.params.id,
        status,
        req.ip
      );
      return ApiResponse.success(res, { user }, `User status changed to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const result = await adminService.getOrders(req.query);
      return ApiResponse.paginated(res, {
        data: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Admin orders retrieved'
      });
    } catch (error) {
      next(error);
    }
  }

  async getDisputes(req, res, next) {
    try {
      const disputes = await adminService.getDisputes(req.query);
      return ApiResponse.success(res, { disputes }, 'Disputes retrieved');
    } catch (error) {
      next(error);
    }
  }

  async resolveDispute(req, res, next) {
    try {
      const { resolutionNotes } = req.body;
      const dispute = await adminService.resolveDispute(req.user._id, req.params.id, resolutionNotes);
      return ApiResponse.success(res, { dispute }, 'Dispute marked as resolved');
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const result = await adminService.getAuditLogs(req.query);
      return ApiResponse.paginated(res, {
        data: result.logs,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Audit logs retrieved'
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const reports = await adminService.getReports();
      return ApiResponse.success(res, { reports }, 'Reports and analytics data retrieved');
    } catch (error) {
      next(error);
    }
  }

  async resetDatabase(req, res, next) {
    try {
      const result = await adminService.resetDatabase();
      return ApiResponse.success(res, result, 'Database wiped and reset successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
