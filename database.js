const { Pool } = require("pg");
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const testConnection = async () => {
  const client = await pool.connect();
  try {
    console.log("Testing database connection...");
    const res = await client.query("SELECT NOW()");
    console.log(
      "Database connection successful. Current time:",
      res.rows[0].now
    );
  } catch (err) {
    console.error("Error testing database connection:", err);
  } finally {
    client.release();
  }
};

testConnection();
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const loadCheckboxStates = async () => {
  try {
    const res = await pool.query(
      "SELECT state FROM checkbox_states WHERE id = 1"
    );
    if (res.rows.length) {
      return res.rows[0].state;
    }
    return Array(100).fill(false);
  } catch (err) {
    console.error("Error loading checkbox states:", err);
    throw err;
  }
};

const saveCheckboxStates = async (checkboxStates) => {
  try {
    await pool.query("UPDATE checkbox_states SET state = $1 WHERE id = 1", [
      checkboxStates,
    ]);
  } catch (err) {
    console.error("Error saving checkbox states:", err);
    throw err;
  }
};
module.exports = {
  loadCheckboxStates,
  saveCheckboxStates,
  pool,
};
