const ApiError = require('../utils/apiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRoles = req.user.roles || [];

    // Super admin bypasses all role constraints
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          `Access denied: Required role (${allowedRoles.join(', ')}), but your account has (${userRoles.join(', ')})`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
