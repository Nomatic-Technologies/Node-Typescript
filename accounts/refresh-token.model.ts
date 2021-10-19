export const mongoose = require('mongoose');
export const Schema = mongoose.Schema;

export const schema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String
});

schema.virtual('isExpired').get(function () {
    return Date.now() >= schema.expires;
});

schema.virtual('isActive').get(function () {
    return !schema.revoked && !schema.isExpired;
});

module.exports = mongoose.model('RefreshToken', schema);