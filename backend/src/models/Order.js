const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    itemType: {
      type: String,
      enum: ['BUY', 'RENT'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    rentalDetails: {
      startDate: { type: Date },
      endDate: { type: Date },
      totalDays: { type: Number },
      securityDeposit: { type: Number, default: 0 },
      rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' }
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemTotal: {
      type: Number,
      required: true
    }
  },
  { _id: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [OrderItemSchema],
    pricing: {
      itemsTotal: {
        type: Number,
        required: true,
        default: 0
      },
      securityDepositTotal: {
        type: Number,
        required: true,
        default: 0
      },
      deliveryFee: {
        type: Number,
        default: 0
      },
      grandTotal: {
        type: Number,
        required: true,
        default: 0
      }
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      default: 'PLACED',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'UPI', 'COD', 'CAMPUS_WALLET'],
      default: 'RAZORPAY'
    },
    paymentDetails: {
      razorpayOrderId: { type: String, index: true },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date }
    },
    pickupOrDelivery: {
      type: {
        type: String,
        enum: ['CAMPUS_PICKUP', 'HOSTEL_DELIVERY'],
        default: 'CAMPUS_PICKUP'
      },
      location: {
        type: String,
        required: true
      },
      contactPhone: {
        type: String,
        required: true
      },
      instructions: {
        type: String,
        default: ''
      }
    },
    cancellationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ 'items.seller': 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
