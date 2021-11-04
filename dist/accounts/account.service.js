"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = require("config.json");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");
var sendEmail = require("../_helpers/send-email");
var db = require("../_helpers/db");
var Role = require("../_helpers/role");
module.exports = {
    authenticate: authenticate,
    refreshToken: refreshToken,
    revokeToken: revokeToken,
    register: register,
    verifyEmail: verifyEmail,
    forgotPassword: forgotPassword,
    validateResetToken: validateResetToken,
    resetPassword: resetPassword,
    getAll: getAll,
    getById: getById,
    create: create,
    update: update,
    delete: _delete,
};
function authenticate(_a) {
    var email = _a.email, password = _a.password, ipAddress = _a.ipAddress;
    return __awaiter(this, void 0, void 0, function () {
        var account, jwtToken, refreshToken;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({ email: email })];
                case 1:
                    account = _b.sent();
                    if (!account ||
                        !account.isVerified ||
                        !bcrypt.compareSync(password, account.passwordHash)) {
                        throw "Email or password is incorrect";
                    }
                    jwtToken = generateJwtToken(account);
                    refreshToken = generateRefreshToken(account, ipAddress);
                    // save refresh token
                    return [4 /*yield*/, refreshToken.save()];
                case 2:
                    // save refresh token
                    _b.sent();
                    // return basic details and tokens
                    return [2 /*return*/, __assign(__assign({}, basicDetails(account)), { jwtToken: jwtToken, refreshToken: refreshToken.token })];
            }
        });
    });
}
function refreshToken(_a) {
    var token = _a.token, ipAddress = _a.ipAddress;
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken, account, newRefreshToken, jwtToken;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getRefreshToken(token)];
                case 1:
                    refreshToken = _b.sent();
                    account = refreshToken.account;
                    newRefreshToken = generateRefreshToken(account, ipAddress);
                    refreshToken.revoked = Date.now();
                    refreshToken.revokedByIp = ipAddress;
                    refreshToken.replacedByToken = newRefreshToken.token;
                    return [4 /*yield*/, refreshToken.save()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, newRefreshToken.save()];
                case 3:
                    _b.sent();
                    jwtToken = generateJwtToken(account);
                    // return basic details and tokens
                    return [2 /*return*/, __assign(__assign({}, basicDetails(account)), { jwtToken: jwtToken, refreshToken: newRefreshToken.token })];
            }
        });
    });
}
function revokeToken(_a) {
    var token = _a.token, ipAddress = _a.ipAddress;
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getRefreshToken(token)];
                case 1:
                    refreshToken = _b.sent();
                    // revoke token and save
                    refreshToken.revoked = Date.now();
                    refreshToken.revokedByIp = ipAddress;
                    return [4 /*yield*/, refreshToken.save()];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function register(params, origin) {
    return __awaiter(this, void 0, void 0, function () {
        var account, isFirstAccount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({ email: params.email })];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, sendAlreadyRegisteredEmail(params.email, origin)];
                case 2: 
                // send already registered error in email to prevent account enumeration
                return [2 /*return*/, _a.sent()];
                case 3:
                    account = new db.Account(params);
                    return [4 /*yield*/, db.Account.countDocuments({})];
                case 4:
                    isFirstAccount = (_a.sent()) === 0;
                    account.role = isFirstAccount ? Role.Admin : Role.User;
                    account.verificationToken = randomTokenString();
                    // hash password
                    account.passwordHash = hash(params.password);
                    // save account
                    return [4 /*yield*/, account.save()];
                case 5:
                    // save account
                    _a.sent();
                    // send email
                    return [4 /*yield*/, sendVerificationEmail(account, origin)];
                case 6:
                    // send email
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function verifyEmail(_a) {
    var token = _a.token;
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({ verificationToken: token })];
                case 1:
                    account = _b.sent();
                    if (!account)
                        throw "Verification failed";
                    account.verified = Date.now();
                    account.verificationToken = undefined;
                    return [4 /*yield*/, account.save()];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function forgotPassword(_a, origin) {
    var email = _a.email;
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({ email: email })];
                case 1:
                    account = _b.sent();
                    // always return ok response to prevent email enumeration
                    if (!account)
                        return [2 /*return*/];
                    // create reset token that expires after 24 hours
                    account.resetToken = {
                        token: randomTokenString(),
                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    };
                    return [4 /*yield*/, account.save()];
                case 2:
                    _b.sent();
                    // send email
                    return [4 /*yield*/, sendPasswordResetEmail(account, origin)];
                case 3:
                    // send email
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function validateResetToken(_a) {
    var token = _a.token;
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({
                        "resetToken.token": token,
                        "resetToken.expires": { $gt: Date.now() },
                    })];
                case 1:
                    account = _b.sent();
                    if (!account)
                        throw "Invalid token";
                    return [2 /*return*/];
            }
        });
    });
}
function resetPassword(_a) {
    var token = _a.token, password = _a.password;
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({
                        "resetToken.token": token,
                        "resetToken.expires": { $gt: Date.now() },
                    })];
                case 1:
                    account = _b.sent();
                    if (!account)
                        throw "Invalid token";
                    // update password and remove reset token
                    account.passwordHash = hash(password);
                    account.passwordReset = Date.now();
                    account.resetToken = undefined;
                    return [4 /*yield*/, account.save()];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getAll() {
    return __awaiter(this, void 0, void 0, function () {
        var accounts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.Account.find()];
                case 1:
                    accounts = _a.sent();
                    return [2 /*return*/, accounts.map(function (x) { return basicDetails(x); })];
            }
        });
    });
}
function getById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccount(id)];
                case 1:
                    account = _a.sent();
                    return [2 /*return*/, basicDetails(account)];
            }
        });
    });
}
function create(params) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.Account.findOne({ email: params.email })];
                case 1:
                    // validate
                    if (_a.sent()) {
                        throw 'Email "' + params.email + '" is already registered';
                    }
                    account = new db.Account(params);
                    account.verified = Date.now();
                    // hash password
                    account.passwordHash = hash(params.password);
                    // save account
                    return [4 /*yield*/, account.save()];
                case 2:
                    // save account
                    _a.sent();
                    return [2 /*return*/, basicDetails(account)];
            }
        });
    });
}
function update(id, params) {
    return __awaiter(this, void 0, void 0, function () {
        var account, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getAccount(id)];
                case 1:
                    account = _b.sent();
                    _a = params.email &&
                        account.email !== params.email;
                    if (!_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.Account.findOne({ email: params.email })];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    // validate (if email was changed)
                    if (_a) {
                        throw 'Email "' + params.email + '" is already taken';
                    }
                    // hash password if it was entered
                    if (params.password) {
                        params.passwordHash = hash(params.password);
                    }
                    // copy params to account and save
                    Object.assign(account, params);
                    account.updated = Date.now();
                    return [4 /*yield*/, account.save()];
                case 4:
                    _b.sent();
                    return [2 /*return*/, basicDetails(account)];
            }
        });
    });
}
function _delete(id) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccount(id)];
                case 1:
                    account = _a.sent();
                    return [4 /*yield*/, account.remove()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// helper functions
function getAccount(id) {
    return __awaiter(this, void 0, void 0, function () {
        var account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!db.isValidId(id))
                        throw "Account not found";
                    return [4 /*yield*/, db.Account.findById(id)];
                case 1:
                    account = _a.sent();
                    if (!account)
                        throw "Account not found";
                    return [2 /*return*/, account];
            }
        });
    });
}
function getRefreshToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.RefreshToken.findOne({ token: token }).populate("account")];
                case 1:
                    refreshToken = _a.sent();
                    if (!refreshToken || !refreshToken.isActive)
                        throw "Invalid token";
                    return [2 /*return*/, refreshToken];
            }
        });
    });
}
function hash(password) {
    return bcrypt.hashSync(password, 10);
}
function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, exports.config.secret, {
        expiresIn: "15m",
    });
}
function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress,
    });
}
function randomTokenString() {
    return crypto.randomBytes(40).toString("hex");
}
function basicDetails(account) {
    var id = account.id, title = account.title, firstName = account.firstName, lastName = account.lastName, email = account.email, role = account.role, created = account.created, updated = account.updated, isVerified = account.isVerified;
    return {
        id: id,
        title: title,
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role,
        created: created,
        updated: updated,
        isVerified: isVerified,
    };
}
function sendVerificationEmail(account, origin) {
    return __awaiter(this, void 0, void 0, function () {
        var message, verifyUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (origin) {
                        verifyUrl = origin + "/account/verify-email?token=" + account.verificationToken;
                        message = "<p>Please click the below link to verify your email address:</p>\n                   <p><a href=\"" + verifyUrl + "\">" + verifyUrl + "</a></p>";
                    }
                    else {
                        message = "<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>\n                   <p><code>" + account.verificationToken + "</code></p>";
                    }
                    return [4 /*yield*/, sendEmail({
                            to: account.email,
                            subject: "Sign-up Verification API - Verify Email",
                            html: "<h4>Verify Email</h4>\n               <p>Thanks for registering!</p>\n               " + message,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sendAlreadyRegisteredEmail(email, origin) {
    return __awaiter(this, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (origin) {
                        message = "<p>If you don't know your password please visit the <a href=\"" + origin + "/account/forgot-password\">forgot password</a> page.</p>";
                    }
                    else {
                        message = "<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>";
                    }
                    return [4 /*yield*/, sendEmail({
                            to: email,
                            subject: "Sign-up Verification API - Email Already Registered",
                            html: "<h4>Email Already Registered</h4>\n               <p>Your email <strong>" + email + "</strong> is already registered.</p>\n               " + message,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sendPasswordResetEmail(account, origin) {
    return __awaiter(this, void 0, void 0, function () {
        var message, resetUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (origin) {
                        resetUrl = origin + "/account/reset-password?token=" + account.resetToken.token;
                        message = "<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>\n                   <p><a href=\"" + resetUrl + "\">" + resetUrl + "</a></p>";
                    }
                    else {
                        message = "<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>\n                   <p><code>" + account.resetToken.token + "</code></p>";
                    }
                    return [4 /*yield*/, sendEmail({
                            to: account.email,
                            subject: "Sign-up Verification API - Reset Password",
                            html: "<h4>Reset Password Email</h4>\n               " + message,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
