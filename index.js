'use strict';

const express = require('express');
const mongoose = require('mongoose');
const api = require('./api');
const port = 400;
const app = express();

// Direct all request with the prefix 'api' to 'api.js'.
app.use('/api', api);

// Connect to MongoDB
mongoose.connect('localhost/app');
mongoose.connection.once('open', () => {
    console.log('mongoose is connected');
    app.listen(port, () => {
        console.log('Server is on port:', port);
    });
});
