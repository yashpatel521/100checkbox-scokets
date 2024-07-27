const passport = require("passport");
const initializeLocalStrategy = require("./strategies/local");
const initializeGoogleStrategy = require("./strategies/google");

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  initializeLocalStrategy();
  initializeGoogleStrategy();

  passport.serializeUser((user, cb) => {
    console.log(`serializeUser ${user.id}`);
    cb(null, user);
  });

  passport.deserializeUser((user, cb) => {
    console.log(`deserializeUser ${user.id}`);
    cb(null, user);
  });
};
