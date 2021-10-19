"use strict";
exports.__esModule = true;
exports.errorHandler = void 0;
require('rootpath')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
exports.errorHandler = require('_middleware/error-handler');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// allow cors requests from any origin and with credentials
app.use(cors({ origin: function (origin, callback) { return callback(null, true); }, credentials: true }));
// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
// swagger docs route
app.use('/api-docs', require('_helpers/swagger'));
// global error handler
app.use(exports.errorHandler);
var port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
