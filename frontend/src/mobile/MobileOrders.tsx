import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LiaClipboardListSolid, LiaCheckCircleSolid, LiaClockSolid, LiaExclamationCircleSolid } from 'react-icons/lia';
import { useAuthContext } from '../features/auth';
import { useToast } from '../features/ui/toast';
import type { OrderItem } from '../features/pharmacy/types';

export const MobileOrders: React.FC = () => {
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?._id) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/auth/${user._id}/orders`, { credentials: 'include' });
      if (!res.ok) throw new Error('Impossible de charger vos commandes');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des commandes';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user?._id, showToast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <LiaExclamationCircleSolid size={24} />
        </div>
        <h2 className="font-semibold">Connexion requise</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Connectez-vous pour consulter vos commandes et leur statut.</p>
        <Link to="/auth/login" className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <LiaClipboardListSolid size={24} />
          </div>
          <div>
            <h2 className="font-semibold">Mes commandes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suivi et validation des achats.</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Chargement...</p>}
      {!loading && orders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          Aucune commande enregistrée pour le moment.
        </div>
      )}

      {orders.map((order) => (
        <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{order._id}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'Date indisponible'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{order.total} €</p>
              <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {order.status === 'completed' ? <LiaCheckCircleSolid size={14} /> : <LiaClockSolid size={14} />}
                {order.status || 'En cours'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {order.medications.map((item) => `${item.medicationName} x${item.quantity}`).join(' • ')}
          </div>
        </div>
      ))}
    </div>
  );
};
