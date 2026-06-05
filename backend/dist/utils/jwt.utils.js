"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../core/env");
const JWT_SECRET = env_1.config.jwt_secret;
const JWT_EXPIRATION = env_1.config.jwt_expiration;
const generateToken = (payload) => {
    const option = { expiresIn: JWT_EXPIRATION };
    console.log(payload);
    const token = jsonwebtoken_1.default.sign({ _id: payload._id.toString() }, JWT_SECRET, option);
    return token;
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error("Token invalid!");
    }
};
exports.verifyToken = verifyToken;
