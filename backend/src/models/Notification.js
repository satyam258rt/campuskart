const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'LISTING_APPROVAL',
        'LISTING_REJECTION',
        'NEW_ORDER',
        'ORDER_STATUS',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILURE',
        'RENTAL_REMINDER',
        'OVERDUE_ALERT',
        'RETURN_REQUEST',
        'DEPOSIT_REFUND',
        'DISPUTE_UPDATE',
        'SYSTEM'
      ],
      default: 'SYSTEM',
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
