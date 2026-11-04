const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const config = require('../config/env');
const emailService = require('./emailService');

class AuthService {
  /**
   * Register a new campus user
   */
  async register(userData) {
    const { name, email, password, phone, campus } = userData;
    const normalizedEmail = email.toLowerCase().trim();

    // Strict Inside-Campus Student Email Verification
    if (config.campusEmail.required) {
      const emailDomain = normalizedEmail.split('@')[1];
      const isAllowed = config.campusEmail.allowedDomains.some(
        (domain) => domain === emailDomain || emailDomain.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        throw ApiError.badRequest(
          `Access restricted: Only inside-campus students are permitted. Please register with your official university email domain (e.g. @mnnit.ac.in). Allowed domains: ${config.campusEmail.allowedDomains.map(d => '@' + d).join(', ')}`
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Check if student ID already registered in the same university
    if (campus?.studentId) {
      const existingStudentId = await User.findOne({
        'campus.studentId': campus.studentId.trim(),
        'campus.university': campus.university || 'Apex Institute of Technology'
      });
      if (existingStudentId) {
        throw ApiError.conflict('A user with this Student ID is already registered for this campus');
      }
    }

    // Inside campus students are granted active status directly
    const initialStatus = 'active';
    const verificationRequired = false;

    let userRoles = ['student'];
    if (userData.role === 'vendor') {
      userRoles = ['vendor', 'seller'];
    } else if (userData.role === 'admin') {
      userRoles = ['admin'];
    } else if (userData.role) {
      userRoles = [userData.role];
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      phone,
      campus: campus || { university: 'Apex Institute of Technology', campusName: 'Main Campus' },
      vendorDetails: userData.vendorDetails || {},
      status: initialStatus,
      isEmailVerified: !verificationRequired,
      roles: userRoles
    });

    let verificationToken = null;
    if (verificationRequired) {
      verificationToken = user.generateVerificationToken();
    }

    await user.save();

    // Send verification email if required
    if (verificationRequired && verificationToken) {
      await emailService.sendVerificationEmail(user, verificationToken);
    }

    const token = user.generateAuthToken();

    return {
      user,
      token,
      verificationRequired
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify inside campus domain on login
    if (config.campusEmail.required) {
      const emailDomain = normalizedEmail.split('@')[1];
      const isAllowed = config.campusEmail.allowedDomains.some(
        (domain) => domain === emailDomain || emailDomain?.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        throw ApiError.unauthorized(`Access Denied: Only inside-campus students with official university email domains (${config.campusEmail.allowedDomains.map(d => '@' + d).join(', ')}) are permitted to log in.`);
      }
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account status
    if (user.status === 'suspended') {
      throw ApiError.forbidden('Your account has been suspended. Please contact campus admin.');
    }

    if (user.status === 'deactivated') {
      throw ApiError.forbidden('Your account is deactivated. Contact support to reactivate.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    return {
      user,
      token
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.avatar) user.avatar = updateData.avatar;

    if (updateData.campus) {
      user.campus = {
        ...user.campus.toObject(),
        ...updateData.campus
      };
    }

    await user.save();
    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password does not match');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  /**
   * Request password reset token
   */
  async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with success to prevent user enumeration
    if (!user) {
      return { message: 'If that email is registered, a password reset link has been sent.' };
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw ApiError.internal('Error sending password reset email');
    }

    return {
      message: 'If that email is registered, a password reset link has been sent.',
      // In development/test mode, return the token for testing convenience
      ...(config.env !== 'production' && { devResetToken: resetToken })
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(rawToken, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw ApiError.badRequest('Password reset token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = user.generateAuthToken();

    return {
      message: 'Password has been reset successfully',
      token,
      user
    };
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(rawToken) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw ApiError.badRequest('Email verification token is invalid or has expired');
    }

    user.isEmailVerified = true;
    if (user.status === 'pending_verification') {
      user.status = 'active';
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return {
      message: 'Email verified successfully. You may now access all campus features.'
    };
  }
}

module.exports = new AuthService();
