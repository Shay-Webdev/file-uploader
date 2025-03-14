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

const createFolderValidation = [
  body('folder_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Folder name is required')
    .isLength({ min: 4 })
    .withMessage('Folder name must be at least 4 characters long')
    .escape()
    .custom(async (req, res) => {
      console.log('req.user in folder validation: ', req);
      console.log('res.locals in folder validation: ', res.req.user);

      const folders = await db.getFoldersByUserId(res.req.user.id);
      const folderNames = folders.map((folder) => folder.name);
      console.log('folder names in folder validation: ', folderNames);

      if (folderNames.includes(req)) {
        throw new Error('Folder with this name already exists');
      }
    }),
];

const uploadValidation = [
  body('folder').custom(async (value, { req }) => {
    if (!req.params.folderId) {
      throw new Error('No folder selected');
    }
    const folder = await db.getFolderByIdInDb(Number(req.params.folderId));
    if (!folder || folder.userId !== req.user.id) {
      throw new Error('Invalid or unauthorized folder');
    }
    return true;
  }),
];
module.exports = {
  validateSignup,
  validateLogin,
  createFolderValidation,
  uploadValidation,
};
