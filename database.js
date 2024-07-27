const db = require("./app/db");

const loadCheckboxStates = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT state FROM checkbox_states WHERE id = 1", (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(JSON.parse(row.state));
      } else {
        resolve(Array(100).fill(false)); // Initialize 100 checkboxes
      }
    });
  });
};

const saveCheckboxStates = (checkboxStates) => {
  return new Promise((resolve, reject) => {
    const stateString = JSON.stringify(checkboxStates);
    db.run(
      "INSERT OR REPLACE INTO checkbox_states (id, state) VALUES (1, ?)",
      [stateString],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

module.exports = {
  loadCheckboxStates,
  saveCheckboxStates,
};
