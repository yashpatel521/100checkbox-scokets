const fs = require("fs");
const { Pool } = require("pg");

const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const executeSqlFile = async (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, "utf8");

    const client = await pool.connect();

    try {
      await client.query(sql);
      console.log("SQL file executed successfully");
    } catch (err) {
      console.error("Error executing SQL file:", err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error reading SQL file:", err);
  } finally {
    await pool.end();
  }
};

const sqlFilePath = "./setup.sql";

executeSqlFile(sqlFilePath);
