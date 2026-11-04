const express = require('express');
const adminController = require('./adminController');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

const router = express.Router();

// Enforce admin privileges for all admin routes
router.use(protect, authorize('admin', 'super_admin'));

router.get('/dashboard/stats', (req, res, next) =>
  adminController.getDashboardStats(req, res, next)
);

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/status', (req, res, next) =>
  adminController.updateUserStatus(req, res, next)
);

router.get('/orders', (req, res, next) => adminController.getOrders(req, res, next));
router.get('/disputes', (req, res, next) => adminController.getDisputes(req, res, next));
router.put('/disputes/:id/resolve', (req, res, next) =>
  adminController.resolveDispute(req, res, next)
);

router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));
router.get('/reports', (req, res, next) => adminController.getReports(req, res, next));
router.post('/reset-database', (req, res, next) => adminController.resetDatabase(req, res, next));

module.exports = router;
