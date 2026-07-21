import { Server as HttpServer } from 'http';
import { notificationBus } from './notification-bus';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/jwt.utils';
import type { Notification } from './notifications';

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

    let decoded: { _id?: string; role?: string; pharmacyId?: string } = {};
    try {
      if (tokenValue) decoded = verifyToken(tokenValue) as typeof decoded;
    } catch {
      decoded = {};
    }

    clients.set(ws, {
      userId: decoded._id,
      role: decoded.role,
      pharmacyId: decoded.pharmacyId,
    });

    ws.on('message', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'system', message: 'Notifications channel is server-driven.' }));
      }
    });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  const deliver = (event: string, payload: unknown): void => {
    const source = payload && typeof payload === 'object' ? payload as Partial<Notification> : {};
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
      if (ws.readyState !== WebSocket.OPEN) return;
      if (notification.userId && client.userId !== notification.userId) return;
      if (!notification.userId && notification.pharmacyId && client.pharmacyId !== notification.pharmacyId) return;
      ws.send(json);
    });
  };

  const unsubscribe = notificationBus.subscribe((event, payload) => deliver(event, payload));

  return () => {
    unsubscribe();
    wss.close();
  };
}
