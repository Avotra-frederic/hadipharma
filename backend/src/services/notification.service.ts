import { notificationBus } from '../core/notification-bus';

export const emitNotification = (event: string, payload: unknown): void => {
  notificationBus.emit(event, payload);
};
