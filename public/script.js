document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const container = document.getElementById("checkboxes-container");

  // Listen for initial state from the server
  socket.on("initialState", (checkboxStates) => {
    checkboxStates.forEach((checked, index) => {
      document.getElementById(`checkbox-${index}`).checked = checked;
    });
  });

  // Listen for updates from the server
  socket.on("checkboxUpdate", (data) => {
    document.getElementById(`checkbox-${data.index}`).checked = data.checked;
  });

  // Handle checkbox change events
  container.addEventListener("change", (event) => {
    if (event.target.classList.contains("checkbox")) {
      const index = event.target.id.split("-")[1];
      const data = {
        index: parseInt(index),
        checked: event.target.checked,
      };
      socket.emit("checkboxChange", data);
    }
  });
});
