import express from "express";
import 'dotenv/config';
import pkg from 'body-parser';
const { urlencoded, json } = pkg;
import { connection } from "./mysql/mysql_connection.js";
import { User } from "./user.js";
import { info, error, warn } from "./logger.js";

const app = express();
const port = process.env.APP_PORT || 5000;

// parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: false }));
// parse application/json
app.use(json());

// Placeholder array of users
// Will be replaced with a DB call later
const peter = new User("Mads", "Hansen", 21);
const amanda = new User("Amanda", "Sørensen", 25);
const theodore = new User("Theodore", "Petersen", 28);
const userList = [peter, amanda, theodore];

// Log request and IP
const logger = (req, res, next) => {
  info(`Message received from ip: ${req.ip} `);
  next();
};

// Health Check endpoint
app.get("/user/health-check", logger, (req, res, next) => {
  info(`Incoming request for heath check, responding`);
  res.status(200).json({ message: "I am alive" });
});

// Return all users
app.get("/user", logger, (req, res, next) => {
  info("Incoming request for all users");
  connection.query(`SELECT * FROM user`, (err, result) => {
    if (err) {
      error(`Failed to get users.\n${err}`);
      return next();
    }
    info(`Responded with a list of all users: ${JSON.stringify({ users: result })}`);
    res.status(200).json({ users: result });
  });
});

// Return a user
app.get("/user/:id", logger, (req, res, next) => {
  const id = parseInt(req.params.id);
  if (Number.isInteger(id)) {
    connection.query(`SELECT * FROM user WHERE id=?`, [id], (err, result) => {
      if (err) {
        error(`Failed to get user of id ${id}.\n${err}`);
        next();
      }
      if (result[0] !== undefined) {
        info(`Responded with user: ${JSON.stringify(result[0])}`);
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
  info("Incoming request to create a new user");
  const newUser = new User(req.body.first_name, req.body.last_name, req.body.age);
  if (newUser.first_name && newUser.last_name && newUser.age) {
    connection.query(
      `INSERT INTO user VALUES(default, ?, ?, ?);`,
      [newUser.first_name, newUser.last_name, newUser.age],
      (err, result) => {
        if (err) {
          error(`Failed to create user: ${JSON.stringify(newUser)}.\n${err}`);
          throw err;
        }
        info(`New user created: ${JSON.stringify(newUser)}`);
        info(`Affected rows: ${result.affectedRows}`);
        return res.status(201).json({ description: "User added", new_user: newUser });
      }
    );
  } else {
    return next();
  }
});

// Update a user
app.patch("/user/:id", logger, (req, res, next) => {
  info(`Update request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  const newUser = new User(req.body.first_name, req.body.last_name, req.body.age);
  if (newUser.first_name && newUser.last_name && newUser.age && Number.isInteger(id)) {
    connection.query(
      `UPDATE user SET first_name=?, last_name=?, age=? where id=?;`,
      [newUser.first_name, newUser.last_name, newUser.age, id],
      (err, result) => {
        if (err) {
          error(`Failed to update user: ${JSON.stringify(newUser)}.\n${err}`);
          return next();
        }
        if (result.affectedRows > 0) {
          info(`Updated user with id: ${req.params.id} to: ${JSON.stringify(newUser)}`);
          info(`Affected rows: ${result.affectedRows}`);
          return res.status(200).json({ description: "User updated", new_user: newUser });
        } else {
          return next();
        }
      }
    );
  } else {
    error(`Bad request to update id: '${req.params.id}' body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ err: 400, description: "Bad request" });
  }
});

// Delete a user
app.delete("/user/:id", logger, (req, res, next) => {
  info(`Delete request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  if (Number.isInteger(id)) {
    connection.query(`DELETE FROM user WHERE id=?`, [id], (err, result, fields) => {
      if (err) {
        error(`Failed to delete user with id: ${id}.\n${err}`);
        return next();
      }
      if (result.affectedRows > 0) {
        info(`Successfully deleted user with id: ${id}`);
        info(`Affected rows: ${result.affectedRows}`);
        return res.status(200).json({ description: "User deleted" });
      } else {
        return next();
      }
    });
  } else {
    return next(); // Returns 404
  }
});

// Invalid health check URL
app.get("/user/health-check*", (req, res) => {
  error(`Invalid request: ${req.url}`);
  res.status(404).json({ err: 404, description: "Invalid URL" });
});

// Invalid user URL
app.get("/user/*", (req, res) => {
  warn(`Invalid get request: ${req.url}`);
  res.status(404).json({ err: 404, description: "ID not found" });
});

// Invalid user POST request
app.post("/user", (req, res) => {
  error(`Bad request body: ${JSON.stringify(req.body)}`);
  res.status(400).json({ err: 400, description: "Bad request" });
});

// Invalid POST request
app.post("/*", (req, res) => {
  error(`Invalid POST url: ${req.url}`);
  res.status(400).json({ err: 400, description: `Can not POST: ${req.url}` });
});

// Invalid PATCH id
app.patch("/user/*", (req, res) => {
  warn(`User id not found: ${req.url}`);
  res.status(404).json({ err: 400, description: "User id not found" });
});

// Invalid PATCH request
app.patch("/*", (req, res) => {
  error(`Invalid PATCH url: ${req.url}`);
  res.status(400).json({ err: 400, description: `Can not update: ${req.url}` });
});

// Invalid DELETE id
app.delete("/user/*", (req, res) => {
  warn(`Id not found: ${req.url}`);
  res.status(404).json({ err: 404, description: "ID not found" });
});

// Invalid DELETE request
app.delete("*", (req, res) => {
  error(`Invalid delete request: ${req.url}`);
  res.status(400).json({ err: 400, description: `Can not delete: ${req.url}` });
});

// Invalid URL
app.all("*", (req, res) => {
  error(`Invalid request: ${req.url}`);
  res.status(404).json({ err: 404, description: "Invalid URL" });
});

app.listen(port, (err) => {
  if (err) {
    return err;
  }
  info(`Server is running on port: ${port}`);
});
