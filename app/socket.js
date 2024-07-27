const { loadCheckboxStates, saveCheckboxStates } = require("../database");

module.exports = (io) => {
  io.use((socket, next) => {
    require("./middleware/session")(socket.request, {}, next);
  });

  io.use((socket, next) => {
    require("passport").initialize()(socket.request, {}, next);
  });

  io.use((socket, next) => {
    require("passport").session()(socket.request, {}, next);
  });

  io.on("connection", (socket) => {
    if (!socket.request.user) {
      return socket.disconnect(true);
    }

    console.log("New client connected");

    loadCheckboxStates()
      .then((states) => {
        socket.emit("initialState", states);
      })
      .catch((err) => {
        console.error("Error loading checkbox states:", err);
      });

    socket.on("checkboxChange", async (data) => {
      const { index, checked } = data;
      try {
        const states = await loadCheckboxStates();
        states[index] = checked;
        await saveCheckboxStates(states);
        io.emit("checkboxUpdate", data);
      } catch (err) {
        console.error("Error saving checkbox states:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
