const Joi = require('joi');

// Password rule: 8-16 chars, >=1 uppercase, >=1 special char
const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/;

const signupSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must follow standard email validation rules',
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must be 8-16 characters, with at least one uppercase letter and one special character',
  }),
  address: Joi.string().max(400).allow('', null).messages({
    'string.max': 'Address must be at most 400 characters',
  }),
});

const adminAddUserSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must follow standard email validation rules',
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must be 8-16 characters, with at least one uppercase letter and one special character',
  }),
  address: Joi.string().max(400).allow('', null).messages({
    'string.max': 'Address must be at most 400 characters',
  }),
  role: Joi.string().valid('user', 'store_owner', 'admin').required(),
});

const adminAddStoreSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Store Name must be at least 20 characters',
    'string.max': 'Store Name must be at most 60 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must follow standard email validation rules',
  }),
  address: Joi.string().max(400).required().messages({
    'string.max': 'Address must be at most 400 characters',
  }),
  owner_id: Joi.number().integer().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const ratingSchema = Joi.object({
  store_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

const passwordUpdateSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'New password must be 8-16 characters, with at least one uppercase letter and one special character',
  }),
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  address: Joi.string().max(400).allow('', null).messages({
    'string.max': 'Address must be at most 400 characters',
  }),
});

// Middleware helper for request body validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = {
  validate,
  signupSchema,
  adminAddUserSchema,
  adminAddStoreSchema,
  loginSchema,
  ratingSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
};