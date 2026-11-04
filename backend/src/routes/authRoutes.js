const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const ApiResponse = require('../utils/apiResponse');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/authValidator');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.post('/verify-email/:token', (req, res, next) =>
  authController.verifyEmail(req, res, next)
);

// Protected routes
router.get('/me', protect, (req, res, next) =>
  authController.getMe(req, res, next)
);

router.put('/profile', protect, validate(updateProfileSchema), (req, res, next) =>
  authController.updateProfile(req, res, next)
);

router.put('/change-password', protect, validate(changePasswordSchema), (req, res, next) =>
  authController.changePassword(req, res, next)
);

router.post('/logout', protect, (req, res) =>
  authController.logout(req, res)
);

// Admin-only test endpoint (verifies RBAC middleware)
router.get('/admin-only', protect, authorize('admin', 'super_admin'), (req, res) => {
  return ApiResponse.success(res, { authorized: true }, 'Admin access verified');
});

module.exports = router;
