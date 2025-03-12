const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('../models/queries');

const validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username must be provided')
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters long')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await db.getUserByEmail(email);
      if (user) {
        throw new Error('Email already in use');
      }
    })
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .escape(),
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .escape(),
];

module.exports = { validateSignup, validateLogin };
