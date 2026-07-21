"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocketServer = createWebSocketServer;
const notification_bus_1 = require("./notification-bus");
const ws_1 = require("ws");
const jwt_utils_1 = require("../utils/jwt.utils");
function createWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws/notifications' });
    const clients = new Map();
    wss.on('connection', (ws, req) => {
        const authHeader = req.headers['authorization'] || '';
        const bearerToken = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : '';
        const cookieToken = req.headers.cookie
            ?.split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith('auth_token='))
            ?.slice('auth_token='.length);
        const url = new URL(req.url || '/ws/notifications', `http://${req.headers.host || 'localhost'}`);
        const queryToken = url.searchParams.get('token') || '';
        const tokenValue = bearerToken || (cookieToken ? decodeURIComponent(cookieToken) : '') || queryToken;
        let decoded = {};
        try {
            if (tokenValue)
                decoded = (0, jwt_utils_1.verifyToken)(tokenValue);
        }
        catch {
            decoded = {};
        }
        clients.set(ws, {
            userId: decoded._id,
            role: decoded.role,
            pharmacyId: decoded.pharmacyId,
        });
        ws.on('message', () => {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'system', message: 'Notifications channel is server-driven.' }));
            }
        });
        ws.on('close', () => clients.delete(ws));
        ws.on('error', () => clients.delete(ws));
    });
    const deliver = (event, payload) => {
        const source = payload && typeof payload === 'object' ? payload : {};
        const notification = {
            ...source,
            id: source.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: event,
            title: source.title || 'Notification',
            message: source.message || 'Une nouvelle action a ete effectuee.',
            read: false,
            createdAt: new Date().toISOString(),
        };
        const json = JSON.stringify(notification);
        clients.forEach((client, ws) => {
            if (ws.readyState !== ws_1.WebSocket.OPEN)
                return;
            if (notification.userId && client.userId !== notification.userId)
                return;
            if (!notification.userId && notification.pharmacyId && client.pharmacyId !== notification.pharmacyId)
                return;
            ws.send(json);
        });
    };
    const unsubscribe = notification_bus_1.notificationBus.subscribe((event, payload) => deliver(event, payload));
    return () => {
        unsubscribe();
        wss.close();
    };
}
