'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');
const models = require('./models');
const api = express();
const ADMIN_TOKEN = 'admintoken';
const VALIDATION_ERROR_NAME = 'ValidationError';
const NOT_FOUND_ERROR_MESSAGE = 'NotFound';
const UNAUTHORIZED_ERROR_MESSAGE = 'Unauthorized';
const CONFLICT_ERROR_MESSAGE = 'Conflict';
const UNSUPPORTED_MEDIA_TYPE_ERROR_MESSAGE = 'UnsupportedMediaType';
const APPLICATION_JSON = 'application/json';

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
});

/* Fetches a list of companies that have been added to MongoDB and
 * ElasticSearch. It uses ElasticSearch to fetch the data.
 * This endpoint uses no authentication.
 * If no company has been added this endpoint returns an empty list.
 */
api.get('/companies', (req, res) => {
    const page = req.query.page || 0;
    const max = req.query.max || 20;
    console.log('page:', page);
    console.log('max:', max);

    const promise = client.search({
        'index': 'companies',
        'type': 'company',
        'size': max,
        'from': page
         //'sort': { 'title': { 'order': 'desc' }}
    });

    promise.then((doc) => {
        res.status(200).send(doc.hits.hits.map((val) => { val.created = undefined; return val; }));
    }, (err) => {
        res.status(500).send(err);
    });
});

/* Fetches a given company that has been added to MongoDB by ID.
 * This endpoints returns a single JSON document if found.
 * If no company is found by the ID then this endpoint returns response
 * with status code 404. No authentication is needed for this endpoint.
 */
api.get('/companies/:id', (req, res) => {
    const id = req.params.id;
    models.Company.findOne({ _id : id }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if(!docs) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            console.log(docs);
            res.status(200).send(docs);
        }
    });
});

/* Allows administrators to add new companies to MongoDB.
 * The company is posted with a POST method and the data sent as a JSON object
 * within the request body.
 * This endpoint is authenticated using the ADMIN_TOKEN header.
 */
api.post('/companies', bodyParser.json(), (req, res) => {
    const token = req.header('ADMIN_TOKEN');
    var requestType = req.get('Content-Type');
    if(!token || token !== ADMIN_TOKEN) {
        res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
    } else {
        const c = new models.Company(req.body);
        c.save(function(err, doc) {
            if (err) {
                if(err.name === VALIDATION_ERROR_NAME) {
                    res.status(412).send(err.name);
                } else {
                    res.status(500).send(err.name);
                }
            } else {
                if(!requestType || requestType !== APPLICATION_JSON) {
                    res.status(415).send(UNSUPPORTED_MEDIA_TYPE_ERROR_MESSAGE);
                }
                else {
                    res.status(201).send({ company_id: c._id});
                }
            }
        })
    }
});

module.exports = api;
