import http from 'http';
import app from './core/app';
import { connexion } from './core/database/mongose';
import { config } from './core/env';
import { createWebSocketServer } from './core/websocket';

const launch = async () => {
    const PORT = config.port || 3000;
    await connexion();

    const server = http.createServer(app);
    createWebSocketServer(server);

    server.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`);
        console.log(`WebSocket available at ws://localhost:${PORT}/ws/notifications`);
    });
}

launch();
