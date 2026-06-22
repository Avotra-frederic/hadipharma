import { useRef, useState } from 'react';
import { LiaBellSolid } from "react-icons/lia"
import { useNotifications } from '../../features/notifications';
import { useAuthContext } from '../../features/auth';

function NotificationBell() {
  const { isAuthenticated } = useAuthContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="relative text-gray-600 dark:text-gray-300">
        <LiaBellSolid size={24} className="md:w-6 md:h-6" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) markAllAsRead();
        }}
        className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        aria-label="Notifications"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <LiaBellSolid size={24} className="md:w-6 md:h-6" />
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Aucune notification</p>
            )}
            {notifications.slice(0, 20).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{notification.title || 'Notification'}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-gray-300">
                    {notification.message}
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
