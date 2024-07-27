const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "database.sqlite");

// Create and connect to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Ensure the checkbox_states table exists
db.run(`CREATE TABLE IF NOT EXISTS checkbox_states (
  id INTEGER PRIMARY KEY,
  state TEXT
)`);

const loadCheckboxStates = async () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT state FROM checkbox_states WHERE id = 1", (err, row) => {
      if (err) {
        console.error("Error loading checkbox states:", err);
        reject(err);
      } else if (row) {
        resolve(JSON.parse(row.state));
      } else {
        resolve(Array(100).fill(false));
      }
    });
  });
};

const saveCheckboxStates = async (checkboxStates) => {
  return new Promise((resolve, reject) => {
    const stateString = JSON.stringify(checkboxStates);
    db.run(
      "INSERT OR REPLACE INTO checkbox_states (id, state) VALUES (1, ?)",
      [stateString],
      (err) => {
        if (err) {
          console.error("Error saving checkbox states:", err);
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
  db,
};
