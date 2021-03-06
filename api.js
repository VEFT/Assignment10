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
        'from': page * max,
        'size': max,
        'body': {
            'sort': { 'title': 'asc' }
        }
    });

    promise.then((doc) => {
        res.status(200).send(doc.hits.hits.map((val) => { val._source.created = undefined; return val; }));
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
    models.Company.findOne({ _id : id }, (err, doc) => {
        if(err) {
            res.status(500).send(err.name);
        } else if(!doc) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            doc.created = undefined;
            res.status(200).send(doc);
        }
    });
});

/* Allows administrators to add new companies to MongoDB and ElasticSearch.
 * The company is posted with a POST method and the data sent as a JSON object
 * within the request body.
 * This endpoint is authenticated using the ADMIN_TOKEN header.
 */
api.post('/companies', bodyParser.json(), (req, res) => {
    const token = req.header('ADMIN_TOKEN');
    const requestType = req.get('Content-Type');

    const name = req.body.title;
    const description = req.body.description;
    const url = req.body.url;
    const created = new Date();

    const data = {
        'title': name,
        'description': description,
        'url': url,
        'created': created
    };

    models.Company.findOne({ title : name }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if (docs) {
            res.status(409).send(CONFLICT_ERROR_MESSAGE);
        } else {
            if(!token || token !== ADMIN_TOKEN) {
                res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
            } else if(!requestType || requestType !== APPLICATION_JSON) {
                res.status(415).send(UNSUPPORTED_MEDIA_TYPE_ERROR_MESSAGE);
            } else {
                const c = new models.Company(req.body);
                c.save(function(save_err, save_doc) {
                    console.log(save_doc);
                    if (save_err) {
                        if(save_err.name === VALIDATION_ERROR_NAME) {
                            res.status(412).send(save_err.name);
                        } else {
                            res.status(500).send(save_err.name);
                        }
                    }
                    else {
                        const promise = client.index({
                            'index': 'companies',
                            'type': 'company',
                            'id': c._id.toString(),
                            'body': data
                        });
                        promise.then((es_doc) => {
                            console.log('doc: ', es_doc);
                            res.status(201).send(es_doc._id);
                        }, (es_err) => {
                            res.status(500).send(es_err);
                        });
                    }
                });
            }
        }
    });
});

/* This endpoint can be used to search for a given company that has been added to Punchy.
 * The search should be placed by into the request body.
 */
api.post('/companies/search', bodyParser.json(), (req, res) => {
    const search_string = req.body.search;
    console.log('searchstring:', search_string);

    const promise = client.search({
        'index': 'companies',
        'type': 'company',
        'body': {
            'query': {
                'bool': {
                    'should': [
                        { 'term': { 'title': search_string } },
                        { 'term': { 'description': search_string } },
                        { 'term': { 'url': search_string } }
                    ]
                }
            },
            'sort': { 'title': 'asc' }
        }
    });

    promise.then((doc) => {
        res.status(200).send(doc.hits.hits.map((val) => { val._source.created = undefined; return val; }));
    }, (err) => {
        res.status(500).send(err.name);
    });
});

/* Method that takes id as a parameter and updates the company with
 * the given id. The company object is passed in the request body.
 * If the company is not found a 404 status code is returned.
 * With the preconditions are not met then 412 error is returned.
 */
api.post('/companies/:id', bodyParser.json(), (req, res) => {
    const token = req.header('ADMIN_TOKEN');
    const requestType = req.get('Content-Type');
    const id = req.params.id;

    // Finding the company with given id.
    models.Company.findOne({ _id : id }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if(!docs) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            if(!token || token !== ADMIN_TOKEN) {
                res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
            } else if(!requestType || requestType !== APPLICATION_JSON) {
                res.status(415).send(UNSUPPORTED_MEDIA_TYPE_ERROR_MESSAGE);
            } else {
                docs.title = req.body.title;
                docs.description = req.body.description;
                docs.url = req.body.url;

                // Updating the object.
                docs.save(function(err) {
                    if(err) {
                        if(err.name === VALIDATION_ERROR_NAME) {
                            res.status(412).send(err.name);
                        } else {
                            res.status(500).send(err.name);
                        }
                    } else {
                        const data = {
                            'title': docs.title,
                            'description': docs.description,
                            'url': docs.url
                        };

                        const promise = client.index({
                            'index': 'companies',
                            'type': 'company',
                            'id': docs._id.toString(),
                            'body': data
                        });

                        promise.then((es_doc) => {
                            res.status(200).send(es_doc._id);
                        }, (es_err) => {
                            res.status(500).send(es_err);
                        });

                    }
                });
            }
        }
    });
});

/*
 * This route is used to remove a previously added company.
 * All the preconditions from POST /companies also apply for this route.
 * If no company is found by the :id the route responds with status code 404.
 * The company document is deleted from both MongoDB and ElasticSearch.
 */
api.delete('/companies/:id', (req, res) => {
    const token = req.header('ADMIN_TOKEN');
    const requestType = req.get('Content-Type');
    const id = req.params.id;

    models.Company.findOne({ _id : id }, (err, docs) => {
        if(err) {
            res.status(500).send(err.name);
        } else if (!docs) {
            res.status(404).send(NOT_FOUND_ERROR_MESSAGE);
        } else {
            if(!token || token !== ADMIN_TOKEN) {
                res.status(401).send(UNAUTHORIZED_ERROR_MESSAGE);
            } else if(!requestType || requestType !== APPLICATION_JSON) {
                res.status(415).send(UNSUPPORTED_MEDIA_TYPE_ERROR_MESSAGE);
            } else {
                models.Company.remove({ _id: id }, function(err) {
                    if(err) {
                        res.status(500).send(err.name);
                    } else {
                        client.delete({
                            index: 'companies',
                            type: 'company',
                            id: id
                        }, function (es_err) {
                            if(es_err) {
                                res.status(500).send(es_err.name);
                            } else {
                                res.status(204).send(id);
                            }
                        });
                    }
                });
            }
        }
    });
});

/*
api.post('/companies/search', bodyParser.json(), (req, res) => {
    console.log('flot');
    res.status(200).send();
});
*/

module.exports = api;
