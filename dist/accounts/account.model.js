"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
exports.mongoose = require('mongoose');
var Schema = exports.mongoose.Schema;
var schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    acceptTerms: Boolean,
    role: { type: String, required: true },
    verificationToken: String,
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});
schema.virtual('isVerified').get(function () {
    return !!(schema.verified || schema.passwordReset);
});
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});
module.exports = exports.mongoose.model('Account', schema);
