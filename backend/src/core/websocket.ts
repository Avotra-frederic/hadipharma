import { Server as HttpServer } from 'http';
import { notificationBus } from './notification-bus';
import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';

type SocketClient = {
  userId?: string;
  role?: string;
  pharmacyId?: string;
};

export function createWebSocketServer(server: HttpServer): () => void {
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });
  const clients = new Map<WebSocket, SocketClient>();

  wss.on('connection', (ws, req) => {
    const authHeader = req.headers['authorization'] || '';
    const tokenValue = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    let decoded: { _id?: string; role?: string; pharmacyId?: string } = {};
    try {
      const secret = process.env.JWT_SECRET;
      if (secret && tokenValue) {
        decoded = jwt.verify(tokenValue, secret) as typeof decoded;
      }
    } catch {
      decoded = {};
    }

    clients.set(ws, {
      userId: decoded._id,
      role: decoded.role,
      pharmacyId: decoded.pharmacyId,
    });

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        const event = typeof parsed.event === 'string' ? parsed.event : 'message';
        notificationBus.emit(event, parsed.payload ?? parsed);
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  const broadcast = (payload: unknown): void => {
    const json = JSON.stringify(payload);
    wss.clients.forEach((ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(json);
    });
  };

  notificationBus.subscribe((_event, payload) => broadcast(payload));

  return () => wss.close();
}
