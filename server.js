//const fs = require('fs');
//const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// configure the app
const app = express();
app.use(express.static('public')); // host static files in /public
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 3000; // server port

// init db routes
const dbRoutes = require("./db.routes.js");
dbRoutes.createRoutes(app);

// GET /api
app.get('/api', (req, res) => {
    res.send("Welcome to the Cities DB");
})

// start the server application
app.listen(port, () => {
    console.log(`Mock server listening at http://localhost:${port}`)
})
