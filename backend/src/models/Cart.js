const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    itemType: {
      type: String,
      enum: ['BUY', 'RENT'],
      required: true,
      default: 'BUY'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    rentalDates: {
      startDate: { type: Date },
      endDate: { type: Date },
      totalDays: { type: Number, default: 1 }
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    itemTotal: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [CartItemSchema],
    subtotal: {
      type: Number,
      default: 0
    },
    totalDeposit: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Method to recalculate cart totals
CartSchema.methods.calculateTotals = function () {
  let subtotal = 0;
  let totalDeposit = 0;

  this.items.forEach((item) => {
    if (item.itemType === 'BUY') {
      item.itemTotal = item.unitPrice * item.quantity;
      item.securityDeposit = 0;
      subtotal += item.itemTotal;
    } else if (item.itemType === 'RENT') {
      const days = item.rentalDates?.totalDays || 1;
      const rentalFee = item.unitPrice * days * item.quantity;
      const deposit = (item.securityDeposit || 0) * item.quantity;
      item.itemTotal = rentalFee + deposit;
      subtotal += rentalFee;
      totalDeposit += deposit;
    }
  });

  this.subtotal = Math.round(subtotal * 100) / 100;
  this.totalDeposit = Math.round(totalDeposit * 100) / 100;
  this.grandTotal = Math.round((this.subtotal + this.totalDeposit) * 100) / 100;
};

module.exports = mongoose.model('Cart', CartSchema);
