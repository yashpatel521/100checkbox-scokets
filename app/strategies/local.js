const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../db");

module.exports = () => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          return done(err);
        }
        if (!row) {
          return done(null, false, { message: "Incorrect email or password." });
        }
        bcrypt.compare(password, row.password, (err, res) => {
          if (res) {
            return done(null, row);
          } else {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }
        });
      });
    })
  );
};
