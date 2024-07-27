const session = require("express-session");

module.exports = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});
