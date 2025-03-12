const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validator = require('../validation&Authentication/validation');
const { validationResult } = require('express-validator');
const db = require('../models/queries');
const bcrypt = require('bcryptjs');
const passport = require('../validation&Authentication/authentication');
const flash = require('connect-flash');

async function getIndexpage(req, res) {
  //   console.log('user logged: ', req.user);

  res.render('index', {
    title: 'Home Page',
    welcomeMessage: "Welcome to Shay's Personal File Uploader",
    description: 'Upload your files and share them with the world',
  });
}

async function getSignup(req, res) {
  res.render('sign-up', {
    title: 'Sign Up',
    welcomeMessage: 'Sign Up',
    description: 'Sign up to get started',
  });
}

const postSignUp = [
  validator.validateSignup,
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('sign-up', {
        title: 'Sign Up',
        welcomeMessage: 'Sign Up',
        description: 'Sign up to get started',
        error: errors.array(),
      });
    }
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name: username,
      email: email,
      password: hashedPassword,
    };
    const createdUser = await db.createUser(user);
    res.redirect('/login');
  },
];

async function getLogin(req, res) {
  res.render('log-in', {
    title: 'Log In',
    welcomeMessage: 'Log In',
    description: 'Log in to get started',
    auth_error: req.flash('error'),
  });
}
const postLogin = [
  validator.validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);
    const auth_error = req.flash('error');
    console.log('auth error: ', auth_error);

    if (!errors.isEmpty() || auth_error.length > 0) {
      return res.status(400).render('log-in', {
        title: 'Log In',
        welcomeMessage: 'Log In',
        description: 'Log in to get started',
        error: errors.array(),
        auth_error: auth_error,
      });
    }

    console.log('user logged: ', req.currentUser);

    next();
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
];

async function getLogout(req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You have logged out successfully');
    res.redirect('/login');
  });
}

async function getAllUsers(req, res) {
  const users = await db.getAllUsers();
  res.render('users', {
    title: 'Users',
    users: users,
  });
}
async function deleteAllUsers(req, res) {
  await db.deleteAllUsers();
  res.redirect('/signup');
}

module.exports = {
  getIndexpage,
  getSignup,
  postSignUp,
  getLogin,
  postLogin,
  getLogout,
  getAllUsers,
  deleteAllUsers,
};
