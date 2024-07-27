const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc").Strategy;
const db = require("../db");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/oauth2/redirect/google",
        scope: ["profile", "email"],
      },
      function verify(issuer, profile, cb) {
        db.get(
          "SELECT * FROM users WHERE googleId = ?",
          [profile.id],
          function (err, row) {
            if (err) {
              return cb(err);
            }
            if (!row) {
              const { displayName, emails } = profile;
              const email = emails[0].value;
              db.run(
                "INSERT INTO users (name, email, type, googleId) VALUES (?, ?, ?, ?)",
                [displayName, email, "google", profile.id],
                function (err) {
                  if (err) {
                    return cb(err);
                  }
                  var id = this.lastID;
                  var user = {
                    id: id,
                    name: displayName,
                    email: email,
                    type: "google",
                    googleId: profile.id,
                  };
                  return cb(null, user);
                }
              );
            } else {
              return cb(null, row);
            }
          }
        );
      }
    )
  );
};
