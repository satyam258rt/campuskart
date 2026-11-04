const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5)'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple reviews on the same resource by the same user
ReviewSchema.index({ user: 1, resource: 1 }, { unique: true });

// Post save hook to recompute seller reputation score
ReviewSchema.post('save', async function () {
  const User = mongoose.model('User');
  const reviews = await mongoose.model('Review').find({
    seller: this.seller,
    status: 'APPROVED'
  });

  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(this.seller, {
      reputationScore: Math.round(avg * 10) / 10,
      ratingsCount: reviews.length
    });
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
