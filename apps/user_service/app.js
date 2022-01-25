const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
	res.send('Hello from user-service');
});

app.listen(port, () => {
	console.log(`User service listening on port: ${port}`);
});

