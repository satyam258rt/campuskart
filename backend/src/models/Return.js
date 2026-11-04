const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema(
  {
    returnId: {
      type: String,
      unique: true,
      index: true
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
      index: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    lessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    expectedReturnDate: {
      type: Date,
      required: true
    },
    actualReturnDate: {
      type: Date
    },
    itemCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'],
      default: 'GOOD'
    },
    damageDescription: {
      type: String,
      default: ''
    },
    evidenceImages: [
      {
        url: { type: String },
        description: { type: String }
      }
    ],
    lateDays: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    damageFee: {
      type: Number,
      default: 0
    },
    depositOriginal: {
      type: Number,
      required: true,
      default: 0
    },
    depositDeductions: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PENDING_INSPECTION', 'APPROVED', 'DISPUTED', 'SETTLED'],
      default: 'PENDING_INSPECTION',
      index: true
    },
    settledAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

ReturnSchema.pre('save', function (next) {
  if (!this.returnId) {
    this.returnId = `RET-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

module.exports = mongoose.model('Return', ReturnSchema);
