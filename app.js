const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oidc").Strategy;
const { join } = require("node:path");
const dotenv = require("dotenv");
const sqlite3 = require("sqlite3").verbose();
const { loadCheckboxStates, saveCheckboxStates } = require("./database");

dotenv.config();

const dbPath = join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Ensure tables exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS federated_credentials (
  user_id INTEGER,
  provider TEXT,
  subject TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

const port = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(join(__dirname, "public")));

app.set("view engine", "ejs");

// Local strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "john" && password === "changeit") {
      console.log("authentication OK");
      return done(null, { id: 1, username });
    } else {
      console.log("wrong credentials");
      return done(null, false);
    }
  })
);

// Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
    },
    function verify(issuer, profile, cb) {
      db.get(
        "SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?",
        [issuer, profile.id],
        function (err, row) {
          if (err) {
            return cb(err);
          }
          if (!row) {
            db.run(
              "INSERT INTO users (name) VALUES (?)",
              [profile.displayName],
              function (err) {
                if (err) {
                  return cb(err);
                }

                var id = this.lastID;
                db.run(
                  "INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)",
                  [id, issuer, profile.id],
                  function (err) {
                    if (err) {
                      return cb(err);
                    }
                    var user = {
                      id: id,
                      name: profile.displayName,
                    };
                    return cb(null, user);
                  }
                );
              }
            );
          } else {
            db.get(
              "SELECT * FROM users WHERE id = ?",
              [row.user_id],
              function (err, row) {
                if (err) {
                  return cb(err);
                }
                if (!row) {
                  return cb(null, false);
                }
                return cb(null, row);
              }
            );
          }
        }
      );
    }
  )
);

passport.serializeUser((user, cb) => {
  console.log(`serializeUser ${user.id}`);
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  console.log(`deserializeUser ${user.id}`);
  cb(null, user);
});

app.get("/", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("index");
});

app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/auth/google", passport.authenticate("google"));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

let checkboxStates = Array(100).fill(false);

loadCheckboxStates()
  .then((states) => {
    checkboxStates = states;
  })
  .catch((err) => {
    console.error("Error loading checkbox states:", err);
  });

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.use((socket, next) => {
  passport.initialize()(socket.request, {}, next);
});

io.use((socket, next) => {
  passport.session()(socket.request, {}, next);
});

io.on("connection", (socket) => {
  if (!socket.request.user) {
    return socket.disconnect(true);
  }

  console.log("New client connected");

  socket.emit("initialState", checkboxStates);

  socket.on("checkboxChange", async (data) => {
    checkboxStates[data.index] = data.checked;
    io.emit("checkboxUpdate", data);
    try {
      await saveCheckboxStates(checkboxStates);
    } catch (err) {
      console.error("Error saving checkbox states:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`Application is running at: http://localhost:${port}`);
});
