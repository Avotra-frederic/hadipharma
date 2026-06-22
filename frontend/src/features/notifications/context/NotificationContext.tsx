import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Notification } from '../types';

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

function buildWsUrl(): string {
  try {
    const apiUrl = new URL(API_BASE_URL);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${apiUrl.host}/ws/notifications`;
  } catch {
    return 'ws://localhost:3000/ws/notifications';
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

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

  const reconnect = useCallback(() => {
    closeSocket();
    setConnectionState('connecting');
    connect();
  }, [closeSocket]);

  const connect = useCallback(() => {
    const wsUrl = buildWsUrl();
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnectionState('open');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Notification;
        setNotifications((prev) => [data, ...prev].slice(0, 200));
      } catch (err) {
        console.error('Invalid notification payload', err);
      }
    };

    socket.onclose = () => {
      wsRef.current = null;
      setConnectionState('closed');
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        reconnect();
      }, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [reconnect]);

  useEffect(() => {
    connect();
    return () => closeSocket();
  }, [connect, closeSocket]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
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
