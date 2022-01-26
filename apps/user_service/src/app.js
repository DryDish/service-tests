const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const db = require("./mysql/mysql_connection.js");
const app = express();
const port = 5000;
const User = require("./user.js").User;
const log = require("./logger.js");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Placeholder array of users
// Will be replaced with a DB call later
const peter = new User("Mads", "Hansen", 21);
const amanda = new User("Amanda", "Sørensen", 25);
const theodore = new User("Theodore", "Petersen", 28);
const userList = [peter, amanda, theodore];

// Log request and IP
const logger = (req, res, next) => {
  log.info(`Message received from ip: ${req.ip} `);
  next();
};

// Return all users
app.get("/user", logger, (req, res, next) => {
  log.info("Incoming request for all users");
  db.connection.query(`SELECT * FROM user`, (error, result) => {
    if (error) {
      log.error(`Failed to get users.\n${error}`);
      return next();
    }
    log.info(`Responded with a list of all users: ${JSON.stringify({ users: result })}`);
    res.status(200).json({ users: result });
  });
});

// Return a user
app.get("/user/:id", logger, (req, res, next) => {
  const id = parseInt(req.params.id);
  if (Number.isInteger(id)) {
    db.connection.query(`SELECT * FROM user WHERE id=?`, [id], (error, result) => {
      if (error) {
        log.error(`Failed to get user of id ${id}.\n${error}`);
        next();
      }
      if (result[0] !== undefined) {
        log.info(`Responded with user: ${JSON.stringify(result[0])}`);
        res.status(200).json(result[0]);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

// Create a user
app.post("/user", logger, (req, res, next) => {
  log.info("Incoming request to create a new user");
  const newUser = new User(req.body.first_name, req.body.last_name, req.body.age);
  if (newUser.first_name && newUser.last_name && newUser.age) {
    db.connection.query(
      `INSERT INTO user VALUES(default, ?, ?, ?);`,
      [newUser.first_name, newUser.last_name, newUser.age],
      (error, result) => {
        if (error) {
          log.error(`Failed to create user: ${JSON.stringify(newUser)}.\n${error}`);
          throw error;
        }
        log.info(`New user created: ${JSON.stringify(newUser)}`);
        log.info(`Affected rows: ${result.affectedRows}`);
        return res.status(201).json({ description: "User added", new_user: newUser });
      }
    );
  } else {
    return next();
  }
});

// Update a user
app.patch("/user/:id", logger, (req, res, next) => {
  log.info(`Update request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  const newUser = new User(req.body.first_name, req.body.last_name, req.body.age);
  if (newUser.first_name && newUser.last_name && newUser.age && Number.isInteger(id)) {
    db.connection.query(
      `UPDATE user SET first_name=?, last_name=?, age=? where id=?;`,
      [newUser.first_name, newUser.last_name, newUser.age, id],
      (error, result) => {
        if (error) {
          log.error(`Failed to update user: ${JSON.stringify(newUser)}.\n${error}`);
          return next();
        }
        if (result.affectedRows > 0) {
          log.info(`Updated user with id: ${req.params.id} to: ${JSON.stringify(newUser)}`);
          log.info(`Affected rows: ${result.affectedRows}`);
          return res.status(200).json({ description: "User updated", new_user: newUser });
        } else {
          return next();
        }
      }
    );
  } else {
    log.error(`Bad request to update id: '${req.params.id}' body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 400, description: "Bad request" });
  }
});

// Delete a user
app.delete("/user/:id", logger, (req, res, next) => {
  log.info(`Delete request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  if (Number.isInteger(id)) {
    db.connection.query(`DELETE FROM user WHERE id=?`, [id], (error, result, fields) => {
      if (error) {
        log.error(`Failed to delete user with id: ${id}.\n${error}`);
        return next();
      }
      if (result.affectedRows > 0) {
        log.info(`Successfully deleted user with id: ${id}`);
        log.info(`Affected rows: ${result.affectedRows}`);
        return res.status(200).json({ description: "User deleted" });
      } else {
        return next();
      }
    });
  } else {
    return next(); // Returns 404
  }
});

// Invalid user POST request
app.post("/user", (req, res) => {
  log.error(`Bad request body: ${JSON.stringify(req.body)}`);
  res.status(400).json({ error: 400, description: "Bad request" });
});

// Invalid POST request
app.post("/*", (req, res) => {
  log.error(`Invalid POST url: ${req.url}`);
  res.status(400).json({ error: 400, description: `Can not POST: ${req.url}` });
});

// Invalid PATCH id
app.patch("/user/*", (req, res) => {
  log.warn(`User id not found: ${req.url}`);
  res.status(404).json({ error: 400, description: "User id not found" });
});

// Invalid PATCH request
app.patch("/*", (req, res) => {
  log.error(`Invalid PATCH url: ${req.url}`);
  res.status(400).json({ error: 400, description: `Can not update: ${req.url}` });
});

// Invalid DELETE id
app.delete("/user/*", (req, res) => {
  log.warn(`Id not found: ${req.url}`);
  res.status(404).json({ error: 404, description: "ID not found" });
});

// Invalid DELETE request
app.delete("*", (req, res) => {
  log.error(`Invalid delete request: ${req.url}`);
  res.status(400).json({ error: 400, description: `Can not delete: ${req.url}` });
});

// Invalid user URL
app.get("/user/*", (req, res) => {
  log.warn(`Invalid get request: ${req.url}`);
  res.status(404).json({ error: 404, description: "ID not found" });
});

// Invalid URL
app.get("*", (req, res) => {
  log.error(`Invalid request: ${req.url}`);
  res.status(404).json({ error: 404, description: "Invalid URL" });
});

app.listen(port, (error) => {
  if (error) {
    return error;
  }
  log.info(`Server is running on port: ${port}`);
});
