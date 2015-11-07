'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const elasticSearch = require('elasticsearch');
const mongoose = require('mongoose');
const api = require('./api');
const port = 400;
const app = express();

// Direct all request with the prefix 'api' to 'api.js'.
app.use('/api', api);

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

// Connect to MongoDB
mongoose.connect('localhost/app');
mongoose.connection.once('open', () => {
    console.log('mongoose is connected');
    app.listen(port, () => {
        console.log('Server is on port:', port);
    });
});
