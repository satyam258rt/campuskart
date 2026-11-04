const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters long',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required'
    }),
  role: Joi.string().valid('student', 'vendor', 'admin').default('student'),
  phone: Joi.string().allow('', null).optional(),
  campus: Joi.object({
    university: Joi.string().optional(),
    campusName: Joi.string().optional(),
    studentId: Joi.string().allow('', null).optional(),
    department: Joi.string().allow('', null).optional(),
    hostelOrAddress: Joi.string().allow('', null).optional()
  }).optional(),
  vendorDetails: Joi.object({
    shopName: Joi.string().allow('', null).optional(),
    stallNumber: Joi.string().allow('', null).optional(),
    businessPhone: Joi.string().allow('', null).optional(),
    categorySpecialization: Joi.array().items(Joi.string()).optional()
  }).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow('', null).optional(),
  bio: Joi.string().max(300).allow('', null).optional(),
  avatar: Joi.object({
    url: Joi.string().uri().optional(),
    publicId: Joi.string().allow('', null).optional()
  }).optional(),
  campus: Joi.object({
    university: Joi.string().optional(),
    campusName: Joi.string().optional(),
    studentId: Joi.string().optional(),
    department: Joi.string().optional(),
    hostelOrAddress: Joi.string().optional()
  }).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.pattern.base': 'New password must contain at least one letter and one number',
      'any.required': 'New password is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .max(128)
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
