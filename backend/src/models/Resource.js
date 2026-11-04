const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Resource category is required'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resource owner is required'],
      index: true
    },
    listingType: {
      type: String,
      enum: ['BUY', 'RENT', 'BOTH'],
      required: [true, 'Listing type is required (BUY, RENT, or BOTH)'],
      index: true
    },
    // Sale pricing (applicable if listingType is BUY or BOTH)
    price: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      default: 0
    },
    // Rental pricing (applicable if listingType is RENT or BOTH)
    rentalPricing: {
      pricePerDay: {
        type: Number,
        min: [0, 'Daily rental price cannot be negative'],
        default: 0
      },
      securityDeposit: {
        type: Number,
        min: [0, 'Security deposit cannot be negative'],
        default: 0
      },
      minDurationDays: {
        type: Number,
        min: [1, 'Minimum rental duration must be at least 1 day'],
        default: 1
      },
      maxDurationDays: {
        type: Number,
        min: [1, 'Maximum rental duration must be at least 1 day'],
        default: 30
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    condition: {
      type: String,
      enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'],
      required: [true, 'Item condition is required'],
      index: true
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
          type: String,
          default: ''
        },
        isCover: {
          type: Boolean,
          default: false
        }
      }
    ],
    campus: {
      university: {
        type: String,
        required: true,
        trim: true,
        default: 'Apex Institute of Technology'
      },
      campusName: {
        type: String,
        required: true,
        trim: true,
        default: 'Main Campus'
      },
      pickupLocation: {
        type: String,
        required: [true, 'Pickup location on campus is required'],
        trim: true
      }
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'ACTIVE',
        'RESERVED',
        'SOLD',
        'RENTED',
        'INACTIVE',
        'REJECTED'
      ],
      default: 'PENDING_APPROVAL',
      index: true
    },
    moderation: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: {
        type: Date
      },
      rejectionReason: {
        type: String,
        default: ''
      }
    },
    viewsCount: {
      type: Number,
      default: 0,
      index: true
    },
    favoritesCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Full text search index on title and description
ResourceSchema.index({ title: 'text', description: 'text' });

// Compound indexes for optimal marketplace queries
ResourceSchema.index({ status: 1, listingType: 1, category: 1, price: 1 });
ResourceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Resource', ResourceSchema);
