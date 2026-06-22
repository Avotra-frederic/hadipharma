export type NotificationType = 'order' | 'prescription' | 'subscription' | 'pharmacy' | 'user' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}
