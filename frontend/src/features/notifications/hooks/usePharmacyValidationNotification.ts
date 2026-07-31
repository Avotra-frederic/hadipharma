import { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../../ui/toast';
import { useAuthContext } from '../../auth';

export const usePharmacyValidationNotification = () => {
  const { notifications } = useNotifications();
  const { showToast } = useToast();
  const { refreshAuth } = useAuthContext();
  const handledIds = useRef(new Set<string>());

  useEffect(() => {
    // Look for pharmacy-validated notifications
    const validationNotifications = notifications.filter(
      (n) => n.type === 'pharmacy-validated' && n.realtime
    );

    validationNotifications.forEach((notification) => {
      if (handledIds.current.has(notification.id)) return;
      handledIds.current.add(notification.id);
      showToast(
        notification.message || 'Votre pharmacie a été validée !',
        'success',
        notification.title || 'Succès'
      );
      void refreshAuth();
    });
  }, [notifications, showToast, refreshAuth]);
};
