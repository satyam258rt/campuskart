const User = require('../../models/User');
const Resource = require('../../models/Resource');
const Order = require('../../models/Order');
const Rental = require('../../models/Rental');
const Payment = require('../../models/Payment');
const Dispute = require('../../models/Dispute');
const AuditLog = require('../../models/AuditLog');
const ApiError = require('../../utils/apiError');

class AdminService {
  /**
   * Aggregate high-level platform metrics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalResources,
      activeListings,
      pendingApprovals,
      totalOrders,
      activeRentals,
      overdueRentals,
      openDisputes,
      paymentStats
    ] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Resource.countDocuments({ status: 'ACTIVE' }),
      Resource.countDocuments({ status: 'PENDING_APPROVAL' }),
      Order.countDocuments(),
      Rental.countDocuments({ status: 'ACTIVE' }),
      Rental.countDocuments({ status: 'OVERDUE' }),
      Dispute.countDocuments({ status: 'OPEN' }),
      Payment.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, totalVolume: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalUsers,
      totalResources,
      activeListings,
      pendingApprovals,
      totalOrders,
      activeRentals,
      overdueRentals,
      openDisputes,
      totalVolume: paymentStats[0]?.totalVolume || 0,
      totalPaymentsCount: paymentStats[0]?.count || 0
    };
  }

  /**
   * User management: list users with search and status filters
   */
  async getUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { email: new RegExp(query.search, 'i') },
        { 'campus.studentId': new RegExp(query.search, 'i') }
      ];
    }
    if (query.status) filter.status = query.status;
    if (query.role) filter.roles = query.role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    return { users, total, page, limit };
  }

  /**
   * Suspend or unsuspend a user
   */
  async updateUserStatus(adminId, targetUserId, newStatus, ipAddress = '') {
    const user = await User.findById(targetUserId);
    if (!user) throw ApiError.notFound('User not found');

    const oldStatus = user.status;
    user.status = newStatus;
    await user.save({ validateBeforeSave: false });

    // Log audit action
    await AuditLog.create({
      adminUser: adminId,
      action: 'UPDATE_USER_STATUS',
      targetType: 'USER',
      targetId: targetUserId,
      details: { oldStatus, newStatus },
      ipAddress
    });

    return user;
  }

  /**
   * List platform orders
   */
  async getOrders(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.orderStatus) filter.orderStatus = query.orderStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('buyer', 'name email campus')
        .populate('items.seller', 'name email campus'),
      Order.countDocuments(filter)
    ]);

    return { orders, total, page, limit };
  }

  /**
   * Disputes management
   */
  async getDisputes(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;

    return Dispute.find(filter)
      .sort({ createdAt: -1 })
      .populate('initiator', 'name email')
      .populate('respondent', 'name email')
      .populate('order')
      .populate('rental');
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(adminId, disputeId, resolutionNotes) {
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) throw ApiError.notFound('Dispute not found');

    dispute.status = 'RESOLVED';
    dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await AuditLog.create({
      adminUser: adminId,
      action: 'RESOLVE_DISPUTE',
      targetType: 'DISPUTE',
      targetId: disputeId,
      details: { resolutionNotes }
    });

    return dispute;
  }

  /**
   * Audit logs
   */
  async getAuditLogs(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminUser', 'name email'),
      AuditLog.countDocuments()
    ]);

    return { logs, total, page, limit };
  }

  /**
   * Analytics Reports
   */
  async getReports() {
    const [listingsByCategory, rentalsByMonth] = await Promise.all([
      Resource.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1 } }
      ]),
      Rental.aggregate([
        {
          $group: {
            _id: { $month: '$createdAt' },
            rentalsCount: { $sum: 1 },
            volume: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    return {
      listingsByCategory,
      rentalsByMonth
    };
  }

  /**
   * Reset and clear marketplace data
   */
  async resetDatabase() {
    const { seedData } = require('../../seeds/seedData');
    await seedData();
    return {
      success: true,
      message: 'Database wiped clean and reset with 0 products. Cycles, Calculators, Other categories and base accounts re-initialized.'
    };
  }
}

module.exports = new AdminService();
