const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");

// Define the path to the SQLite database file
const dbPath = path.resolve(__dirname, "database.sqlite");

// Define the seed user's details
const seedUser = {
  id: 1,
  name: "test User",
  email: "test@test.com",
  password: "Test1234",
  type: "local",
  googleId: null, // local user doesn't have a googleId
};

// Default state for 100 checkboxes
const defaultCheckboxState = JSON.stringify(Array(100).fill(false));

// SQL commands for setting up the database
const sqlCommands = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  type TEXT,
  googleId TEXT
);

-- Create checkbox_states table
CREATE TABLE IF NOT EXISTS checkbox_states (
  id INTEGER PRIMARY KEY,
  state TEXT
);

-- Insert default checkbox states if not exists
INSERT OR IGNORE INTO checkbox_states (id, state) VALUES (1, '${defaultCheckboxState}');
`;

// Open a connection to the SQLite database (automatically creates the file if it doesn't exist)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const executeSqlCommands = (sql, callback) => {
  db.serialize(() => {
    db.exec(sql, (err) => {
      if (err) {
        console.error("Error executing SQL commands:", err);
      } else {
        console.log("SQL commands executed successfully");
      }
      callback(err);
    });
  });
};

const insertDefaultCheckboxState = (callback) => {
  const insertCheckboxStateSql = `INSERT OR IGNORE INTO checkbox_states (id, state) VALUES (1, ?)`;
  db.run(insertCheckboxStateSql, [defaultCheckboxState], (err) => {
    if (err) {
      console.error("Error inserting default checkbox states:", err);
    } else {
      console.log("Default checkbox states inserted successfully");
    }
    callback(err);
  });
};

const insertSeedUser = (user) => {
  const { id, name, email, password, type, googleId } = user;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return;
    }

    const insertUserSql = `INSERT OR IGNORE INTO users (id, name, email, password, type, googleId) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(
      insertUserSql,
      [id, name, email, hash, type, googleId],
      function (err) {
        if (err) {
          console.error("Error inserting seed user:", err);
        } else {
          console.log("Seed user inserted successfully");
        }
        db.close((err) => {
          if (err) {
            console.error("Error closing the database:", err);
          } else {
            console.log("Database connection closed.");
          }
        });
      }
    );
  });
};

// Execute the SQL commands and then insert the default checkbox states and the seed user
executeSqlCommands(sqlCommands, (err) => {
  if (!err) {
    insertDefaultCheckboxState((err) => {
      if (!err) {
        insertSeedUser(seedUser);
      } else {
        db.close((err) => {
          if (err) {
            console.error("Error closing the database:", err);
          } else {
            console.log("Database connection closed.");
          }
        });
      }
    });
  } else {
    db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
});
