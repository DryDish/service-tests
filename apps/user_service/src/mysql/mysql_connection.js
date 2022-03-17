import 'dotenv/config';
import { createConnection } from "mysql2";
import {info, warn, error} from "../logger.js";

const connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
});


function createUserTable() {
  info("Creating user table!");
  connection.query(
    `CREATE TABLE IF NOT EXISTS user (id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), age INT)`,
    (error, result) => {
      if (error) {
        error("Failed to create table");
        throw error;
      }
      info(JSON.stringify(result));
    }
  );
}

async function dropUserTable() {
  info("Dropping user table!");
  connection.query(`DROP TABLE IF EXISTS user`, async(error, result) => {
    if (error) {
      error("Failed to drop table");
      throw error;
    }
    info(JSON.stringify(result));
    return result;
  });
}

export {
  connection,
  createUserTable,
  dropUserTable
};
