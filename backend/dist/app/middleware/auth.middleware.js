"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guest = exports.auth = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const auth = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }
    try {
        (0, jwt_utils_1.verifyToken)(auth_token);
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Token invalid!" });
    }
});
exports.auth = auth;
const guest = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { auth_token } = req.cookies;
    if (auth_token) {
        res.status(401).json({ message: "Access denied" });
        return;
    }
    next();
});
exports.guest = guest;
