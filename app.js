const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const { loadCheckboxStates, saveCheckboxStates } = require("./database"); // Import functions

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

let checkboxStates = Array(100).fill(false);

loadCheckboxStates()
  .then((states) => {
    checkboxStates = states;
  })
  .catch((err) => {
    console.error("Error loading checkbox states:", err);
  });

io.on("connection", (socket) => {
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

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
