// backend/src/utils/validators.js
const Joi = require('joi');

const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  userType: Joi.string().valid('customer', 'restaurant', 'delivery_agent').default('customer')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  postalCode: Joi.string().required(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  addressType: Joi.string().valid('home', 'work', 'other'),
  isDefault: Joi.boolean()
});

const allergyProfileSchema = Joi.object({
  allergies: Joi.array().items(Joi.string()),
  dietaryRestrictions: Joi.array().items(Joi.string()),
  healthConditions: Joi.array().items(Joi.string()),
  spicePreference: Joi.string().valid('mild', 'medium', 'spicy')
});

const menuItemSchema = Joi.object({
  restaurantId: Joi.string().optional(), // For create when not derived from user
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  image_url: Joi.string().allow('').optional(),
  imageUrl: Joi.string().allow('').optional(), // Accept both formats
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  spiceLevel: Joi.string().valid('mild', 'medium', 'spicy').allow(null).optional(),
  preparationTime: Joi.number().allow(null).optional(),
  isAvailable: Joi.boolean().optional(),
  // CRITICAL: Allow ingredients array
  ingredients: Joi.array().items(
    Joi.object({
      ingredientId: Joi.string().required(),
      quantity: Joi.string().optional()
    })
  ).optional()
});

const orderSchema = Joi.object({
  restaurantId: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      menuItemId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      exclusions: Joi.array().items(Joi.string())
    })
  ).optional(), // Controller derives items from cart; keep optional
  deliveryAddressId: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  specialInstructions: Joi.string().allow('').optional()
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw {
      name: 'ValidationError',
      message: 'Validation failed',
      details: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    };
  }
  return value;
};

module.exports = {
  userRegistrationSchema,
  loginSchema,
  addressSchema,
  allergyProfileSchema,
  menuItemSchema,
  orderSchema,
  validate
};
