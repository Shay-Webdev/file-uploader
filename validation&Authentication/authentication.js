const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../models/queries');
const flash = require('connect-flash');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await db.getUserByEmail(email);
        // console.log('user in auth: ', user);

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('user in serialize: ', user);

  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id);
    // console.log('user in deserialize: ', user);

    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
