const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwt');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    roles: {
      type: [String],
      enum: ['student', 'vendor', 'seller', 'lessor', 'admin', 'super_admin'],
      default: ['student']
    },
    campus: {
      university: {
        type: String,
        trim: true,
        default: 'Apex Institute of Technology'
      },
      campusName: {
        type: String,
        trim: true,
        default: 'Main Campus'
      },
      studentId: {
        type: String,
        trim: true,
        index: true
      },
      department: {
        type: String,
        trim: true
      },
      hostelOrAddress: {
        type: String,
        trim: true
      }
    },
    vendorDetails: {
      shopName: {
        type: String,
        trim: true
      },
      stallNumber: {
        type: String,
        trim: true
      },
      businessPhone: {
        type: String,
        trim: true
      },
      categorySpecialization: [
        {
          type: String,
          trim: true
        }
      ],
      verifiedVendor: {
        type: Boolean,
        default: false
      }
    },
    phone: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: ''
    },
    avatar: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      },
      publicId: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended', 'deactivated'],
      default: 'active',
      index: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    reputationScore: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return generateToken({
    id: this._id,
    email: this.email,
    roles: this.roles,
    name: this.name,
    status: this.status
  });
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Token expires in 1 hour
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

// Generate email verification token
UserSchema.methods.generateVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  // Token expires in 24 hours
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);
