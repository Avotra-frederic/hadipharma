import { useEffect, useRef, useState } from 'react';
import { LiaBellSolid } from "react-icons/lia"
import { useNotifications } from '../../features/notifications';
import { useAuthContext } from '../../features/auth';

const typeStyles: Record<string, string> = {
  'order-created': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  'order-status-updated': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  'prescription-status-updated': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  'pharmacy-validated': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  'pharmacy-created': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  'stock-updated': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  'medicine-created': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
  'medicine-updated': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
  'medicine-deleted': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  'purchase-created': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  'purchase-status-updated': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
};

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function NotificationBell() {
  const { isAuthenticated } = useAuthContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead, connectionState, reconnect } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  if (!isAuthenticated) {
    return (
      <div className="relative text-gray-600 dark:text-gray-300">
        <LiaBellSolid size={24} className="md:w-6 md:h-6" />
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
          if (!open) markAllAsRead();
        }}
        className="relative rounded-full p-1 text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
        aria-label="Notifications"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <LiaBellSolid size={24} className="md:w-6 md:h-6" />
          <span
            className={`absolute right-0 top-0 h-2 w-2 rounded-full ring-2 ring-white dark:ring-gray-900 ${
              connectionState === 'open'
                ? 'bg-emerald-500'
                : connectionState === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
            }`}
          />
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 bottom-24 z-[100] mt-3 max-h-[min(30rem,calc(100vh-7rem))] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:w-[22rem] md:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {connectionState === 'open' ? 'Temps reel actif' : connectionState === 'connecting' ? 'Connexion...' : 'Hors ligne'}
              </p>
            </div>
            {connectionState !== 'open' && (
              <button
                type="button"
                onClick={reconnect}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Reconnecter
              </button>
            )}
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 md:max-h-96">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Aucune notification</p>
            )}
            {notifications.slice(0, 20).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  notification.read ? 'opacity-75' : 'bg-emerald-50/50 dark:bg-emerald-900/10'
                }`}
              >
                <span className={`mt-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${typeStyles[notification.type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                  {notification.type.split('-')[0]}
                </span>
                <span className="min-w-0 flex-1 break-words text-sm text-gray-800 dark:text-gray-200">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{notification.title || 'Notification'}</span>
                    {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
