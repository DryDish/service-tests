import { createConnection } from "mysql2";
import {info, warn, error} from "../logger.js";
import 'dotenv/config';

const connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
});


function createUserTable() {
  warn("Creating user table!");
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

function dropUserTable() {
  warn("Dropping user table!");
  connection.query(`DROP TABLE IF EXISTS user`, (error, result) => {
    if (error) {
      error("Failed to drop table");
      throw error;
    }
    info(JSON.stringify(result));
  });
}

export {
  connection,
  createUserTable,
  dropUserTable
};
