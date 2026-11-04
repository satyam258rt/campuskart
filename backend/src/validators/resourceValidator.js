const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createResourceSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 3 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).max(3000).required().messages({
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required'
  }),
  category: Joi.string().regex(objectIdRegex).required().messages({
    'string.pattern.base': 'Category must be a valid ID',
    'any.required': 'Category is required'
  }),
  listingType: Joi.string().valid('BUY', 'RENT', 'BOTH').required().messages({
    'any.only': 'Listing type must be BUY, RENT, or BOTH',
    'any.required': 'Listing type is required'
  }),
  price: Joi.when('listingType', {
    is: Joi.valid('BUY', 'BOTH'),
    then: Joi.number().min(0).required().messages({
      'any.required': 'Price is required for sale listings'
    }),
    otherwise: Joi.number().min(0).default(0)
  }),
  rentalPricing: Joi.when('listingType', {
    is: Joi.valid('RENT', 'BOTH'),
    then: Joi.object({
      pricePerDay: Joi.number().min(0).required().messages({
        'any.required': 'Daily rental price is required'
      }),
      securityDeposit: Joi.number().min(0).required().messages({
        'any.required': 'Security deposit is required'
      }),
      minDurationDays: Joi.number().min(1).default(1),
      maxDurationDays: Joi.number().min(1).default(30)
    }).required(),
    otherwise: Joi.object({
      pricePerDay: Joi.number().default(0),
      securityDeposit: Joi.number().default(0),
      minDurationDays: Joi.number().default(1),
      maxDurationDays: Joi.number().default(30)
    }).optional()
  }),
  quantity: Joi.number().integer().min(1).default(1),
  condition: Joi.string()
    .valid('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')
    .required()
    .messages({
      'any.only': 'Condition must be NEW, LIKE_NEW, GOOD, FAIR, or POOR',
      'any.required': 'Condition is required'
    }),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        publicId: Joi.string().allow('', null).optional(),
        isCover: Joi.boolean().default(false)
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product image is required',
      'any.required': 'Product images are required'
    }),
  campus: Joi.object({
    university: Joi.string().optional(),
    campusName: Joi.string().optional(),
    pickupLocation: Joi.string().required().messages({
      'any.required': 'Campus pickup location is required'
    })
  }).required(),
  specifications: Joi.object().unknown(true).optional(),
  status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL', 'ACTIVE').default('PENDING_APPROVAL')
});

const updateResourceSchema = Joi.object({
  title: Joi.string().min(3).max(150).optional(),
  description: Joi.string().min(10).max(3000).optional(),
  category: Joi.string().regex(objectIdRegex).optional(),
  listingType: Joi.string().valid('BUY', 'RENT', 'BOTH').optional(),
  price: Joi.number().min(0).optional(),
  rentalPricing: Joi.object({
    pricePerDay: Joi.number().min(0).optional(),
    securityDeposit: Joi.number().min(0).optional(),
    minDurationDays: Joi.number().min(1).optional(),
    maxDurationDays: Joi.number().min(1).optional()
  }).optional(),
  quantity: Joi.number().integer().min(1).optional(),
  condition: Joi.string().valid('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR').optional(),
  specifications: Joi.object().unknown(true).optional(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        publicId: Joi.string().allow('', null).optional(),
        isCover: Joi.boolean().default(false)
      })
    )
    .min(1)
    .optional(),
  campus: Joi.object({
    university: Joi.string().optional(),
    campusName: Joi.string().optional(),
    pickupLocation: Joi.string().optional()
  }).optional(),
  status: Joi.string().valid('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE').optional()
});

const rejectResourceSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Rejection reason must be at least 5 characters',
    'any.required': 'Rejection reason is required'
  })
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  rejectResourceSchema
};
