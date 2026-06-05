"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connexion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../env");
const connexion = async () => {
    const MONGO_URI = env_1.config.mongoUri || "mongodb://127.0.0.1:27017/hadipharma";
    try {
        await mongoose_1.default.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        mongoose_1.default.connection.on("connected", () => {
            console.log("Mongoose connecté");
        });
        mongoose_1.default.connection.on("error", (error) => {
            console.error("Erreur mongoose:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.log("Mongoose deconnecté");
        });
    }
    catch (error) {
        console.log("Error DB:", error);
        process.exit(1);
    }
};
exports.connexion = connexion;
