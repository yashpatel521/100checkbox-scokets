const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const path = require("node:path");
const dotenv = require("dotenv");
const sessionMiddleware = require("./app/middleware/session");
const initializePassport = require("./app/passport");
const initializeSocket = require("./app/socket");

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Set the views directory
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "ejs");

app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Initialize Passport
initializePassport(app);

// Routes
app.use("/", require("./app/routes/index"));
app.use("/", require("./app/routes/auth"));

// Socket.IO
initializeSocket(io);

httpServer.listen(port, () => {
  console.log(`Application is running at: http://localhost:${port}`);
});
