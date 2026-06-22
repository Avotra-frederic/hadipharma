export type NotificationType = 'order' | 'prescription' | 'subscription' | 'pharmacy' | 'user' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  createdAt: Date;
  read: boolean;
  userId?: string;
  pharmacyId?: string;
  metadata?: Record<string, unknown>;
}
