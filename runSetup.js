const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the path to the SQLite database file
const dbPath = path.resolve(__dirname, "database.sqlite");

// Open a connection to the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const executeSqlFile = async (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, "utf8");

    db.serialize(() => {
      db.exec(sql, (err) => {
        if (err) {
          console.error("Error executing SQL file:", err);
        } else {
          console.log("SQL file executed successfully");
        }
      });
    });
  } catch (err) {
    console.error("Error reading SQL file:", err);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
};

const sqlFilePath = "./setup.sql";

executeSqlFile(sqlFilePath);
