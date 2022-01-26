const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;
const User = require("./user.js").User;
const log = require('./logger.js');
require("dotenv").config();

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
  const userJson = {};
  Object.assign(userJson, userList);
  log.info("Responded with a list of all users");
  res.status(200).json(userJson);
});

// Return a user
app.get("/user/:id", logger, (req, res, next) => {
  const id = parseInt(req.params.id);
  const totalUsers = userList.length;
  if (id < totalUsers) {
    log.info(`Responded with user named: ${userList[id].first_name}`);
    res.status(200).json({ user: userList[id] });
  } else {
    next(); // Returns 404
  }
});

// Create a user
app.post("/user", logger, (req, res, next) => {
  log.info("Incoming request to create a new user");
  const newUser = new User(
    req.body.first_name,
    req.body.last_name,
    req.body.age
  );
  if (newUser.first_name && newUser.last_name && newUser.age) {
    userList.push(newUser);
    log.info(`New user created: ${JSON.stringify(newUser)}`);
    res.status(201).json({ description: "User added", new_user: newUser });
  } else {
    next();
  }
});

// Update a user
app.patch("/user/:id", logger, (req, res, next) => {
  log.info(`Update request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  const totalUsers = userList.length;
  if (id < totalUsers) {
    const newUser = new User(
      req.body.first_name,
      req.body.last_name,
      req.body.age
    );
    if (newUser.first_name && newUser.last_name && newUser.age) {
      log.info(`Updated user with id: ${req.params.id} to: ${JSON.stringify(newUser)}`);
      userList[id] = newUser;
      res.status(200).json({ description: "User updated", new_user: newUser });
    }
  } else {
    next();
  }
});

// Delete a user
app.delete("/user/:id", logger, (req, res, next) => {
  log.info(`Delete request received for id: ${req.params.id}`);
  const id = parseInt(req.params.id);
  const totalUsers = userList.length;
  if (id < totalUsers && userList[id]) {
    userList.splice(id);
    log.info(`Successfully deleted user with id: ${id}`);
    res.status(200).json({ description: "User deleted" });
  } else {
    next(); // Returns 404
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
  res
    .status(400)
    .json({ error: 400, description: `Can not delete: ${req.url}` });
});

// Invalid user URL
app.get("/user/*", (req, res) => {
  log.warn(`Invalid request: ${req.url}`);
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
