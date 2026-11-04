const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const result = await notificationService.getMyNotifications(req.user._id, req.query);
      return ApiResponse.paginated(res, {
        data: result.notifications,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Notifications retrieved'
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
