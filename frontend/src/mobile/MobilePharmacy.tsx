import React, { useMemo, useState } from 'react';
import { LiaBellSolid, LiaCheckCircleSolid, LiaClipboardListSolid, LiaClockSolid, LiaTruckSolid } from 'react-icons/lia';
import { useAuthContext } from '../features/auth';
import { usePharmacyAdmin } from '../features/admin/hooks/usePharmacyAdmin';
import { useOrders } from '../features/admin/hooks/useAdmin';
import { useNotifications } from '../features/notifications';
import type { IOrder } from '../features/admin/types';

const statusOptions: Array<{ value: IOrder['status']; label: string }> = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'Préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

const statusLabel: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'Préparation',
  ready: 'Prête',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export const MobilePharmacy: React.FC = () => {
  const { user } = useAuthContext();
  const { pharmacy } = usePharmacyAdmin();
  const { data: orders = [], isLoading: ordersLoading, updateStatus } = useOrders(pharmacy?._id || '');
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const pendingOrders = useMemo(() => orders.filter((order) => ['pending', 'confirmed', 'preparing'].includes(order.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((order) => order.status === 'completed').length, [orders]);
  const waitingOrders = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);
  const recentNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

  const handleStatusChange = async (orderId: string, status: IOrder['status']) => {
    if (!pharmacy?._id) return;
    setUpdatingOrderId(orderId);
    try {
      await updateStatus(orderId, status);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'pharmacist') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <LiaClipboardListSolid size={24} />
        </div>
        <h2 className="font-semibold">Gestion pharmacie</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cette vue est réservée aux gestionnaires de pharmacie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-100">Tableau de bord</p>
        <h2 className="mt-2 text-2xl font-semibold">{pharmacy?.name || 'Votre pharmacie'}</h2>
        <p className="mt-2 text-sm text-emerald-50">{pharmacy?.address || 'Suivez vos commandes, vos alertes et l’activité de votre pharmacie depuis votre mobile.'}</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Aperçu rapide</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vue d’ensemble de la journée.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">Commandes actives</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{pendingOrders.length}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">En attente</p>
            <p className="mt-2 text-2xl font-semibold text-amber-700 dark:text-amber-300">{waitingOrders}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-900/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">Terminées</p>
            <p className="mt-2 text-2xl font-semibold text-sky-700 dark:text-sky-300">{completedOrders}</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-3 dark:bg-violet-900/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">Notifications</p>
            <p className="mt-2 text-2xl font-semibold text-violet-700 dark:text-violet-300">{unreadCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Commandes récentes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mettez à jour le statut directement depuis l’application.</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {pendingOrders.length} à traiter
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {ordersLoading ? (
            <p className="text-sm text-slate-500">Chargement des commandes...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune commande pour le moment.</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order._id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{order._id}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {order.customerInfo?.firstName || 'Client'} {order.customerInfo?.lastName || ''}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {order.medications.map((item) => `${item.medicationName} x${item.quantity}`).join(' • ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{order.total} €</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {order.status === 'completed' ? <LiaCheckCircleSolid size={14} /> : <LiaClockSolid size={14} />}
                      {statusLabel[order.status] || order.status}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <LiaTruckSolid size={16} />
                    {order.paymentMethod || 'Paiement non défini'}
                  </div>
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order._id}
                    onChange={(event) => void handleStatusChange(order._id, event.target.value as IOrder['status'])}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Notifications récentes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lisez vos alertes directement depuis votre téléphone.</p>
          </div>
          {unreadCount > 0 && (
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune notification récente.</p>
          ) : (
            recentNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => markAsRead(notification.id)}
                className={`flex w-full items-start justify-between rounded-2xl border px-3 py-3 text-left ${notification.read ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'}`}
              >
                <div>
                  <p className="text-sm font-semibold">{notification.title || 'Notification'}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                </div>
                <div className="ml-3 shrink-0 rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <LiaBellSolid size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
