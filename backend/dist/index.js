"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./core/app"));
const mongose_1 = require("./core/database/mongose");
const env_1 = require("./core/env");
const websocket_1 = require("./core/websocket");
const launch = async () => {
    const PORT = env_1.config.port || 3000;
    await (0, mongose_1.connexion)();
    const server = http_1.default.createServer(app_1.default);
    (0, websocket_1.createWebSocketServer)(server);
    server.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
        console.log(`WebSocket available at ws://localhost:${PORT}/ws/notifications`);
    });
};
launch();
