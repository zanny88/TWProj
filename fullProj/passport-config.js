const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./userModel');


// Funzione che configura la strategia locale.
function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    const user = await User.findOne({name: username});
    if (user == null) {
      return done(null, false, { message: 'No user with that name' });
    }

    try {
      if (await bcrypt.compare(password, user.passw)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.name));
  passport.deserializeUser((username, done) => {
    const user = User.findOne({name: username});
    done(null, user);
  });
}

module.exports = initialize;
