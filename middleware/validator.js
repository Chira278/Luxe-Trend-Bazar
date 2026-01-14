const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate
];

// User login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Order creation validation rules
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Cart must have at least one item'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.name').trim().notEmpty().withMessage('Name is required'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  orderValidation,
  validate
};
