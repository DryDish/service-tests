const mysql = require("mysql2");
const log = require("../logger.js");
require("dotenv").config();

const info = () => { 
  log.info("DB_HOST: ", process.env.DB_HOST);
  log.info("DB_USER: ", process.env.DB_USER);
  log.info("DB_PASS: ", process.env.DB_PASS);
  log.info("DB_SCHEMA: ", process.env.DB_SCHEMA);
};
info();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
});


function createUserTable() {
  connection.query(
    `CREATE TABLE IF NOT EXISTS user (id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), age INT)`,
    (error, result) => {
      if (error) {
        log.error();
        throw error;
      }
      log.info(result);
    }
  );
}

function dropUserTable() {
  connection.query(`DROP TABLE IF EXISTS user`, (error, result) => {
    if (error) {
      log.error();
      throw error;
    }
    log.info(result);
  });
}

module.exports = {
  connection,
};
