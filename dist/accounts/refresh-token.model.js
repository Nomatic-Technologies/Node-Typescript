"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.Schema = exports.mongoose = void 0;
exports.mongoose = require('mongoose');
exports.Schema = exports.mongoose.Schema;
exports.schema = new exports.Schema({
    account: { type: exports.Schema.Types.ObjectId, ref: 'Account' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});
exports.schema.virtual('isExpired').get(function () {
    return Date.now() >= exports.schema.expires;
});
exports.schema.virtual('isActive').get(function () {
    return !exports.schema.revoked && !exports.schema.isExpired;
});
module.exports = exports.mongoose.model('RefreshToken', exports.schema);
