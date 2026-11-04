const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(60).required().messages({
    'string.empty': 'Category name is required',
    'any.required': 'Category name is required'
  }),
  description: Joi.string().max(250).allow('', null).optional(),
  icon: Joi.string().optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(60).optional(),
  description: Joi.string().max(250).allow('', null).optional(),
  icon: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().integer().min(0).optional()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
