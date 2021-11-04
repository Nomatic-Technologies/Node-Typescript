"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = exports.Role = exports.authorize = exports.validateRequest = exports.Joi = exports.router = exports.express = void 0;
exports.express = require("express");
exports.router = exports.express.Router();
exports.Joi = require("joi");
exports.validateRequest = require("../_middleware/validate-request");
exports.authorize = require("../_middleware/authorize");
exports.Role = require("../_helpers/role");
exports.accountService = require("./account.service");
// routes
exports.router.post("/authenticate", authenticateSchema, authenticate);
exports.router.post("/refresh-token", refreshToken);
exports.router.post("/revoke-token", exports.authorize(), revokeTokenSchema, revokeToken);
exports.router.post("/register", registerSchema, register);
exports.router.post("/verify-email", verifyEmailSchema, verifyEmail);
exports.router.post("/forgot-password", forgotPasswordSchema, forgotPassword);
exports.router.post("/validate-reset-token", validateResetTokenSchema, validateResetToken);
exports.router.post("/reset-password", resetPasswordSchema, resetPassword);
exports.router.get("/", exports.authorize(exports.Role.Admin), getAll);
exports.router.get("/:id", exports.authorize(), getById);
exports.router.post("/", exports.authorize(exports.Role.Admin), createSchema, create);
exports.router.put("/:id", exports.authorize(), updateSchema, update);
exports.router.delete("/:id", exports.authorize(), _delete);
module.exports = exports.router;
function authenticateSchema(req, res, next) {
    var schema = exports.Joi.object({
        email: exports.Joi.string().required(),
        password: exports.Joi.string().required(),
    });
    exports.validateRequest(req, next, schema);
}
function authenticate(req, res, next) {
    var _a = req.body, email = _a.email, password = _a.password;
    var ipAddress = req.ip;
    exports.accountService
        .authenticate({ email: email, password: password, ipAddress: ipAddress })
        .then(function (_a) {
        var refreshToken = _a.refreshToken, account = __rest(_a, ["refreshToken"]);
        setTokenCookie(res, refreshToken);
        res.json(account);
    })
        .catch(next);
}
function refreshToken(req, res, next) {
    var token = req.cookies.refreshToken;
    var ipAddress = req.ip;
    exports.accountService
        .refreshToken({ token: token, ipAddress: ipAddress })
        .then(function (_a) {
        var refreshToken = _a.refreshToken, account = __rest(_a, ["refreshToken"]);
        setTokenCookie(res, refreshToken);
        res.json(account);
    })
        .catch(next);
}
function revokeTokenSchema(req, res, next) {
    var schema = exports.Joi.object({
        token: exports.Joi.string().empty(""),
    });
    exports.validateRequest(req, next, schema);
}
function revokeToken(req, res, next) {
    // accept token from request body or cookie
    var token = req.body.token || req.cookies.refreshToken;
    var ipAddress = req.ip;
    if (!token)
        return res.status(400).json({ message: "Token is required" });
    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== exports.Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    exports.accountService
        .revokeToken({ token: token, ipAddress: ipAddress })
        .then(function () { return res.json({ message: "Token revoked" }); })
        .catch(next);
}
function registerSchema(req, res, next) {
    var schema = exports.Joi.object({
        title: exports.Joi.string().required(),
        firstName: exports.Joi.string().required(),
        lastName: exports.Joi.string().required(),
        email: exports.Joi.string().email().required(),
        password: exports.Joi.string().min(6).required(),
        confirmPassword: exports.Joi.string().valid(exports.Joi.ref("password")).required(),
        acceptTerms: exports.Joi.boolean().valid(true).required(),
    });
    exports.validateRequest(req, next, schema);
}
function register(req, res, next) {
    exports.accountService
        .register(req.body, req.get("origin"))
        .then(function () {
        return res.json({
            message: "Registration successful, please check your email for verification instructions",
        });
    })
        .catch(next);
}
function verifyEmailSchema(req, res, next) {
    var schema = exports.Joi.object({
        token: exports.Joi.string().required(),
    });
    exports.validateRequest(req, next, schema);
}
function verifyEmail(req, res, next) {
    exports.accountService
        .verifyEmail(req.body)
        .then(function () {
        return res.json({ message: "Verification successful, you can now login" });
    })
        .catch(next);
}
function forgotPasswordSchema(req, res, next) {
    var schema = exports.Joi.object({
        email: exports.Joi.string().email().required(),
    });
    exports.validateRequest(req, next, schema);
}
function forgotPassword(req, res, next) {
    exports.accountService
        .forgotPassword(req.body, req.get("origin"))
        .then(function () {
        return res.json({
            message: "Please check your email for password reset instructions",
        });
    })
        .catch(next);
}
function validateResetTokenSchema(req, res, next) {
    var schema = exports.Joi.object({
        token: exports.Joi.string().required(),
    });
    exports.validateRequest(req, next, schema);
}
function validateResetToken(req, res, next) {
    exports.accountService
        .validateResetToken(req.body)
        .then(function () { return res.json({ message: "Token is valid" }); })
        .catch(next);
}
function resetPasswordSchema(req, res, next) {
    var schema = exports.Joi.object({
        token: exports.Joi.string().required(),
        password: exports.Joi.string().min(6).required(),
        confirmPassword: exports.Joi.string().valid(exports.Joi.ref("password")).required(),
    });
    exports.validateRequest(req, next, schema);
}
function resetPassword(req, res, next) {
    exports.accountService
        .resetPassword(req.body)
        .then(function () {
        return res.json({ message: "Password reset successful, you can now login" });
    })
        .catch(next);
}
function getAll(req, res, next) {
    exports.accountService
        .getAll()
        .then(function (accounts) { return res.json(accounts); })
        .catch(next);
}
function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (req.params.id !== req.user.id && req.user.role !== exports.Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    exports.accountService
        .getById(req.params.id)
        .then(function (account) { return (account ? res.json(account) : res.sendStatus(404)); })
        .catch(next);
}
function createSchema(req, res, next) {
    var schema = exports.Joi.object({
        title: exports.Joi.string().required(),
        firstName: exports.Joi.string().required(),
        lastName: exports.Joi.string().required(),
        email: exports.Joi.string().email().required(),
        password: exports.Joi.string().min(6).required(),
        confirmPassword: exports.Joi.string().valid(exports.Joi.ref("password")).required(),
        role: exports.Joi.string().valid(exports.Role.Admin, exports.Role.User).required(),
    });
    exports.validateRequest(req, next, schema);
}
function create(req, res, next) {
    exports.accountService
        .create(req.body)
        .then(function (account) { return res.json(account); })
        .catch(next);
}
function updateSchema(req, res, next) {
    var schemaRules = {
        title: exports.Joi.string().empty(""),
        firstName: exports.Joi.string().empty(""),
        lastName: exports.Joi.string().empty(""),
        email: exports.Joi.string().email().empty(""),
        password: exports.Joi.string().min(6).empty(""),
        confirmPassword: exports.Joi.string().valid(exports.Joi.ref("password")).empty(""),
    };
    var schema = exports.Joi.object(schemaRules).with("password", "confirmPassword");
    exports.validateRequest(req, next, schema);
}
function update(req, res, next) {
    // users can update their own account and admins can update any account
    if (req.params.id !== req.user.id && req.user.role !== exports.Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    exports.accountService
        .update(req.params.id, req.body)
        .then(function (account) { return res.json(account); })
        .catch(next);
}
function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    if (req.params.id !== req.user.id && req.user.role !== exports.Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    exports.accountService
        .delete(req.params.id)
        .then(function () { return res.json({ message: "Account deleted successfully" }); })
        .catch(next);
}
// helper functions
function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    var cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    res.cookie("refreshToken", token, cookieOptions);
}
