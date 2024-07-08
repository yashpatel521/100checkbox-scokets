document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

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
  const checkboxes = document.querySelectorAll(".checkbox");
  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      const data = {
        index: index,
        checked: checkbox.checked,
      };
      socket.emit("checkboxChange", data);
    });
  });
});
