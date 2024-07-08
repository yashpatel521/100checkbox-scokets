const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 4000;

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route for the home page
app.get("/", (req, res) => {
  res.render("index");
});

// Store the state of the checkboxes
let checkboxStates = Array(100).fill(false);

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  // Send current checkbox states to the new client
  socket.emit("initialState", checkboxStates);

  // Handle checkbox change
  socket.on("checkboxChange", (data) => {
    checkboxStates[data.index] = data.checked;
    io.emit("checkboxUpdate", data); // Broadcast the change to all clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
