import { notificationBus } from '../core/notification-bus';
import AdminService from './admin.service';
import User from '../app/model/user.model';
import NotificationModel from '../app/model/notification.model';

export type NotificationPayload = {
  userId?: string;
  pharmacyId?: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export const emitNotification = (event: string, payload: NotificationPayload): void => {
  if (!payload.userId) return;
  void NotificationModel.create({
    user: payload.userId,
    pharmacy: payload.pharmacyId,
    type: event,
    title: payload.title,
    message: payload.message,
    metadata: payload.metadata || {},
  }).then((notification) => {
    notificationBus.emit(event, {
      ...payload,
      id: notification._id.toString(),
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    });
  }).catch((error) => console.error('Unable to save notification:', error));
};

export const notifyUsers = (userIds: Array<string | undefined | null>, event: string, payload: Omit<NotificationPayload, 'userId'>): void => {
  [...new Set(userIds.filter((id): id is string => Boolean(id)))].forEach((userId) => {
    emitNotification(event, { ...payload, userId });
  });
};

export const notifyPharmacyAdmins = async (pharmacyId: string, event: string, payload: Omit<NotificationPayload, 'userId' | 'pharmacyId'>): Promise<void> => {
  const admins = await AdminService.getAdminsByPharmacy(pharmacyId);
  notifyUsers(
    admins.filter((admin: any) => admin.active).map((admin: any) => admin.user?._id?.toString()),
    event,
    { ...payload, pharmacyId }
  );
};

export const notifySuperAdmins = async (event: string, payload: Omit<NotificationPayload, 'userId'>): Promise<void> => {
  const superAdmins = await User.find({ role: 'superadmin', isActive: { $ne: false } }).select('_id');
  notifyUsers(superAdmins.map((user) => user._id.toString()), event, payload);
};

export const notifyRole = async (role: string, event: string, payload: Omit<NotificationPayload, 'userId'>): Promise<void> => {
  const users = await User.find({ role, isActive: { $ne: false } }).select('_id');
  notifyUsers(users.map((user) => user._id.toString()), event, payload);
};
