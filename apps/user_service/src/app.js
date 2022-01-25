const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const User = require('./user.js').User;
require('dotenv').config();


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
    console.log(`Message received from ip: ${req.ip} `);
    const id = parseInt(req.params.id);
    if (!Number.isNaN(id)) {
        console.log(`Request is for id: { ${id} }`);
    }
    next();
};


// Return a user
app.get('/user/:id', logger, (req, res, next) => {
    const id = parseInt(req.params.id);
    const totalUsers = userList.length;
    if (id < totalUsers) {
        console.log(`Responded with user: ${userList[id].first_name} `);
        res.send(userList[id]);
    } else {
        next(); // Returns 404
    };
});

// Return all users
app.get('/user', logger, (req, res, next) => {
    const userJson = {};
    Object.assign(userJson, userList);
    console.log(userJson);
    res.send(userJson);
});

// Invalid URL
app.get('/user/*', (req, res) => {
    console.log(`Invalid request: ${req.url}`);
    res.status(404).json({error: 404, description: "Invalid ID"});
});

// Invalid URL
app.get('*', (req, res) => {
    console.log(`Invalid request: ${req.url}`);
    res.status(404).json({error: 404, description: "Invalid URL"});
});

app.listen(port, (error) => {
    if (error){ return error };
    console.log("Server is running on :", port);
});
