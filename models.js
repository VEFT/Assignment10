'use strict';

const mongoose = require('mongoose');

const CompanySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1
    },
    description: {
        type: String,
        required: true,
        minlength: 1
    },
    url: {
        type: String,
        required: true,
        minlength: 1
    },
    created: {
        type: Date,
        default: new Date()
    }
});

module.exports = {
    Company: mongoose.model('Company', CompanySchema)
};
