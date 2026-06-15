import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../features/ui/toast';

import type { OrderItem } from '../../features/pharmacy/types';

const ProfileOrders = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/auth/${user._id}/orders`, { credentials: 'include' });
      if (res.status === 401) {
        showToast('Veuillez vous connecter pour voir vos commandes', 'error');
        navigate('/auth/login');
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Impossible de charger les commandes (${res.status}${text ? `: ${text}` : ''})`);
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des commandes';
      console.error(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const canCancel = (status: string) => !['completed', 'cancelled'].includes(status);

  const cancelOrder = async (orderId: string, pharmacyId: string) => {
    if (!confirm('Voulez-vous annuler cette commande ?')) return;
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) throw new Error('Échec de l\'annulation');
      showToast('Commande annulée', 'success');
      fetchOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      console.error(message);
      showToast(message, 'error');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profil"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <FiChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mes commandes</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Suivez l’état de vos commandes récentes et retrouvez les détails.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {loading && <p>Chargement...</p>}
          {!loading && orders.length === 0 && <p>Aucune commande trouvée.</p>}
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Commande</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{order._id}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-4 py-2 text-sm font-semibold">
                    {order.status}
                  </span>
                  {canCancel(order.status) && (
                    <button onClick={() => cancelOrder(order._id, order.pharmacyId as unknown as string)} className="text-sm text-rose-600 hover:underline">
                      Annuler
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm text-slate-500 dark:text-slate-400">
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">Date</span>
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                </div>
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">Total</span>
                  {order.total} €
                </div>
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">Paiement</span>
                  {order.paymentMethod ? (
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {order.paymentMethod === 'cash' ? '💵 Espèces' : order.paymentMethod === 'visa' ? '💳 Visa' : order.paymentMethod === 'mobile_money' ? '📱 Mobile Money' : '🅿️ PayPal'}
                    </span>
                  ) : '-'}
                </div>
                <div>
                  <span className="block font-medium text-slate-800 dark:text-slate-100">Articles</span>
                  {order.medications.map(m => `${m.medicationName} x${m.quantity}`).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileOrders;
