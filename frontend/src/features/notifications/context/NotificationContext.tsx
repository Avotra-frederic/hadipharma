import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Notification } from '../types';
import { useAuthContext } from '../../auth';

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closed';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  connectionState: ConnectionState;
  reconnect: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

function buildWsUrl(token?: string | null): string {
  try {
    const apiUrl = new URL(API_BASE_URL);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = new URL(`${protocol}//${apiUrl.host}/ws/notifications`);
    if (token) wsUrl.searchParams.set('token', token);
    return wsUrl.toString();
  } catch {
    const fallbackUrl = new URL('ws://localhost:3000/ws/notifications');
    if (token) fallbackUrl.searchParams.set('token', token);
    return fallbackUrl.toString();
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?limit=50`, { credentials: 'include' });
      if (!response.ok) return;
      const data = await response.json();
      const history = Array.isArray(data.notifications)
        ? (data.notifications as Notification[]).map((notification) => ({ ...notification, realtime: false }))
        : [];
      setNotifications((current) => {
        const byId = new Map(current.map((notification) => [notification.id, notification]));
        history.forEach((notification) => byId.set(notification.id, notification));
        return [...byId.values()]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 200);
      });
    } catch {
      // WebSocket delivery remains available when history cannot be loaded.
    }
  }, [isAuthenticated]);

  const closeSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isAuthenticated) {
      setConnectionState('idle');
      return;
    }

    setConnectionState('connecting');
    const wsUrl = buildWsUrl(token);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnectionState('open');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Notification;
        if (!data.id || !data.message) return;
        const realtimeNotification = { ...data, realtime: true };
        setNotifications((prev) => {
          if (prev.some((notification) => notification.id === data.id)) {
            return prev.map((notification) => notification.id === data.id
              ? { ...notification, ...realtimeNotification }
              : notification);
          }
          return [realtimeNotification, ...prev].slice(0, 200);
        });
      } catch (err) {
        console.error('Invalid notification payload', err);
      }
    };

    socket.onclose = () => {
      wsRef.current = null;
      setConnectionState('closed');
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [isAuthenticated, token]);

  const reconnect = useCallback(() => {
    closeSocket();
    connect();
  }, [closeSocket, connect]);

  useEffect(() => {
    if (!isAuthenticated) {
      closeSocket();
      setNotifications([]);
      setConnectionState('idle');
      return;
    }

    connect();
    void loadHistory();
    return () => closeSocket();
  }, [connect, closeSocket, isAuthenticated, loadHistory, user?._id]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    void fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    void fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT', credentials: 'include' });
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        connectionState,
        reconnect,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
