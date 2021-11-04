"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = require("config.json");
var mongoose = require("mongoose");
var connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
};
mongoose.connect(process.env.MONGODB_URI || exports.config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;
module.exports = {
    Account: require("../accounts/account.model"),
    RefreshToken: require("../accounts/refresh-token.model"),
    isValidId: isValidId,
};
function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
