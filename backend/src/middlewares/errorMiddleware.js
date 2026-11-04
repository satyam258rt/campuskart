const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const config = require('../config/env');

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error in non-test mode
  if (config.env !== 'test') {
    logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`);
    if (err.stack && error.statusCode === 500) {
      logger.error(err.stack);
    }
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields[0] || 'field';
    const message = `A record with this ${fieldName} already exists (${err.keyValue[fieldName]})`;
    error = ApiError.conflict(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    const message = errors[0]?.message || 'Validation error';
    error = ApiError.badRequest(message, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authorization token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authorization token has expired');
  }

  const response = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error',
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(config.env === 'development' && { stack: err.stack })
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = {
  notFound,
  errorHandler
};
