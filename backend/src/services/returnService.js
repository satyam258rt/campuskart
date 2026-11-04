const Return = require('../models/Return');
const Rental = require('../models/Rental');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');

class ReturnService {
  /**
   * Renter submits a return request
   */
  async requestReturn(renterId, returnData) {
    const { rentalId, expectedReturnDate, notes } = returnData;

    const rental = await Rental.findById(rentalId).populate('resource');
    if (!rental) throw ApiError.notFound('Rental not found');

    if (rental.renter.toString() !== renterId.toString()) {
      throw ApiError.forbidden('Only the renter can request return for this rental');
    }

    if (!['ACTIVE', 'DUE', 'OVERDUE'].includes(rental.status)) {
      throw ApiError.badRequest(`Cannot request return for rental in status ${rental.status}`);
    }

    // Check if return request already exists
    const existingReturn = await Return.findOne({
      rental: rentalId,
      status: { $in: ['PENDING_INSPECTION', 'APPROVED'] }
    });
    if (existingReturn) {
      throw ApiError.conflict('A return request is already pending for this rental');
    }

    const returnDoc = new Return({
      rental: rental._id,
      resource: rental.resource._id,
      renter: renterId,
      lessor: rental.owner,
      expectedReturnDate: new Date(expectedReturnDate || Date.now()),
      depositOriginal: rental.securityDeposit,
      notes: notes || '',
      status: 'PENDING_INSPECTION'
    });

    await returnDoc.save();

    rental.status = 'RETURN_REQUESTED';
    await rental.save();

    // Notify Lessor
    await Notification.create({
      recipient: rental.owner,
      sender: renterId,
      type: 'RETURN_REQUEST',
      title: 'Return Request Submitted',
      message: `The renter requested to return "${rental.resource.title}". Please inspect and settle deposit.`,
      link: `/returns/${returnDoc._id}`
    });

    return returnDoc;
  }

  /**
   * Lessor inspects condition and records damages/late days
   */
  async inspectReturn(returnId, lessorId, inspectionData) {
    const { itemCondition = 'GOOD', damageDescription = '', damageFee = 0, evidenceImages = [] } = inspectionData;

    const returnDoc = await Return.findById(returnId).populate('rental');
    if (!returnDoc) throw ApiError.notFound('Return record not found');

    if (returnDoc.lessor.toString() !== lessorId.toString()) {
      throw ApiError.forbidden('Only the lessor can perform return inspection');
    }

    const rental = returnDoc.rental;
    const now = new Date();
    returnDoc.actualReturnDate = now;
    returnDoc.itemCondition = itemCondition;
    returnDoc.damageDescription = damageDescription;
    returnDoc.damageFee = Number(damageFee) || 0;
    returnDoc.evidenceImages = evidenceImages;

    // Calculate Late Fees
    let lateDays = 0;
    let lateFee = 0;
    const end = new Date(rental.endDate);
    if (now > end) {
      const diffMs = now.getTime() - end.getTime();
      lateDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const multiplier = rental.lateFeePolicy?.perDayMultiplier || 1.5;
      lateFee = Math.round(lateDays * rental.dailyRate * multiplier * 100) / 100;
    }

    returnDoc.lateDays = lateDays;
    returnDoc.lateFee = lateFee;

    const totalDeductions = lateFee + returnDoc.damageFee;
    returnDoc.depositDeductions = Math.min(returnDoc.depositOriginal, totalDeductions);
    returnDoc.refundAmount = Math.max(0, returnDoc.depositOriginal - returnDoc.depositDeductions);
    returnDoc.status = 'APPROVED';

    await returnDoc.save();
    return returnDoc;
  }

  /**
   * Settle security deposit, complete return & free resource back to ACTIVE
   */
  async settleDeposit(returnId, lessorId) {
    const returnDoc = await Return.findById(returnId).populate(['rental', 'resource']);
    if (!returnDoc) throw ApiError.notFound('Return record not found');

    if (returnDoc.lessor.toString() !== lessorId.toString()) {
      throw ApiError.forbidden('Only the lessor can settle this return');
    }

    returnDoc.status = 'SETTLED';
    returnDoc.settledAt = new Date();
    await returnDoc.save();

    // Update Rental
    const rental = returnDoc.rental;
    rental.status = 'CLOSED';
    rental.actualReturnDate = returnDoc.actualReturnDate || new Date();
    rental.settlement = {
      lateDays: returnDoc.lateDays,
      lateFee: returnDoc.lateFee,
      damageFee: returnDoc.damageFee,
      refundedDeposit: returnDoc.refundAmount,
      settledAt: new Date(),
      notes: `Settled with deduction of ₹${returnDoc.depositDeductions}. Refund: ₹${returnDoc.refundAmount}`
    };
    await rental.save();

    // CRITICAL: Make the resource available again
    await Resource.findByIdAndUpdate(returnDoc.resource._id, {
      status: 'ACTIVE'
    });

    // Notify Renter of deposit refund
    await Notification.create({
      recipient: returnDoc.renter,
      sender: lessorId,
      type: 'DEPOSIT_REFUND',
      title: 'Security Deposit Settled',
      message: `Your return has been completed. Refund amount: ₹${returnDoc.refundAmount}. Deductions: ₹${returnDoc.depositDeductions}`,
      link: `/rentals/${rental._id}`
    });

    return {
      message: 'Return completed and deposit settled successfully. Resource is now active again.',
      returnDoc,
      rental
    };
  }

  /**
   * Get returns
   */
  async getReturns(userId, role = 'renter') {
    const filter = role === 'lessor' ? { lessor: userId } : { renter: userId };
    return Return.find(filter)
      .sort({ createdAt: -1 })
      .populate('resource', 'title images condition')
      .populate('renter', 'name email phone campus')
      .populate('lessor', 'name email phone campus')
      .populate('rental');
  }

  /**
   * Get return by ID
   */
  async getReturnById(returnId, userId) {
    const returnDoc = await Return.findById(returnId)
      .populate('resource', 'title images condition campus')
      .populate('renter', 'name email phone campus avatar')
      .populate('lessor', 'name email phone campus avatar')
      .populate('rental');

    if (!returnDoc) throw ApiError.notFound('Return record not found');

    const isParty =
      returnDoc.renter._id.toString() === userId.toString() ||
      returnDoc.lessor._id.toString() === userId.toString();

    if (!isParty) throw ApiError.forbidden('Access denied');

    return returnDoc;
  }
}

module.exports = new ReturnService();
