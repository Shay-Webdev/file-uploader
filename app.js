const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const flash = require('connect-flash');
require('dotenv').config();

const { indexRouter } = require('./routers/indexRouter');

const assetsPath = __dirname + '/public';
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: false,
    }),
  })
);
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});
app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
