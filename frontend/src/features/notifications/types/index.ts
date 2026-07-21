export type NotificationType =
  | 'order-created'
  | 'order-status-updated'
  | 'prescription-status-updated'
  | 'pharmacy-created'
  | 'pharmacy-validated'
  | 'pharmacy-deactivated'
  | 'pharmacy-subscription-updated'
  | 'pharmacy-updated'
  | 'pharmacy-deleted'
  | 'pharmacy-review-created'
  | 'pharmacy-photo-updated'
  | 'stock-updated'
  | 'medicine-created'
  | 'medicine-updated'
  | 'medicine-deleted'
  | 'purchase-created'
  | 'purchase-status-updated'
  | 'pharmacy-user-created'
  | 'pharmacy-user-role-updated'
  | 'pharmacy-user-removed'
  | 'pharmacy-permissions-updated'
  | 'pharmacy-user-status-updated'
  | 'user-role-updated'
  | 'user-status-updated'
  | 'user-deleted'
  | 'system'
  | string;

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  createdAt: string;
  read: boolean;
  userId?: string;
  pharmacyId?: string;
  metadata?: Record<string, unknown>;
}
