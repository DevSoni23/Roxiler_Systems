const Joi = require('joi');

const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/;

const signupSchema = Joi.object({
  name: Joi.string().min(20).max(60).required().messages({
    'string.min': 'Name must be at least 20 characters',
    'string.max': 'Name must be at most 60 characters',
  }),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'Password must be 8-16 characters, with at least one uppercase letter and one special character',
  }),
  address: Joi.string().max(400).allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const ratingSchema = Joi.object({
  store_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

// Generic middleware factory — pass it any schema, get back a validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const passwordUpdateSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': 'New password must be 8-16 characters, with at least one uppercase letter and one special character',
  }),
});

module.exports = { validate, signupSchema, loginSchema, ratingSchema, passwordUpdateSchema };