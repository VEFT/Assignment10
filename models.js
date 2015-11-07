'use strict';

const mongoose = require('mongoose');

const CompanySchema = mongoose.Schema({
    name: {
              type: String,
      required: true,
      minlength: 1
          },
      description: {
                       type: String,
      required: true,
      minlength: 1
                   },
      punchcard_lifetime: {
                              type: Number,
      required: true
                          }
});

module.exports = {
    Company: mongoose.model('Company', CompanySchema),
};
