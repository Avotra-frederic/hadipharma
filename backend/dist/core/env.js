"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = (key, required = true) => {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Variable environnement manquante:${key}`);
    }
    return value;
};
exports.config = {
    nodeEnv: getEnv("NODE_ENV"),
    port: parseInt(getEnv("PORT")),
    mongoUri: getEnv("MONGO_URI"),
    jwt_secret: getEnv("JWT_SECRET"),
    jwt_expiration: getEnv("JWT_EXPIRATION")
};
