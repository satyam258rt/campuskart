const ApiError = require('../utils/apiError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      const primaryMessage = errorDetails[0]?.message || 'Validation error';
      return next(ApiError.badRequest(primaryMessage, errorDetails));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
