const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      unique: true,
      index: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    startDate: {
      type: Date,
      required: [true, 'Rental start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'Rental end date is required'],
      index: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0
    },
    rentalFee: {
      type: Number,
      required: true,
      min: 0
    },
    securityDeposit: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: [
        'RESERVED',
        'ACTIVE',
        'DUE',
        'OVERDUE',
        'RETURN_REQUESTED',
        'RETURNED',
        'CLOSED'
      ],
      default: 'RESERVED',
      index: true
    },
    lateFeePolicy: {
      perDayMultiplier: {
        type: Number,
        default: 1.5 // 1.5x daily rate per day overdue
      },
      gracePeriodHours: {
        type: Number,
        default: 4
      }
    },
    settlement: {
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
      refundedDeposit: {
        type: Number,
        default: 0
      },
      settledAt: {
        type: Date
      },
      notes: {
        type: String,
        default: ''
      }
    },
    actualReturnDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate human-readable rental ID
RentalSchema.pre('save', function (next) {
  if (!this.rentalId) {
    this.rentalId = `RNT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

// Index for overlap lookups
RentalSchema.index({ resource: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Rental', RentalSchema);
