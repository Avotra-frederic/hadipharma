import React, { useState, useEffect } from 'react';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import { getOrders, updateOrderStatus } from '../api/admin';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import type { IOrder } from '../types';

interface OrdersManagerProps {
  onNavigate?: (section: string) => void;
}

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const ORDER_STATUSES = [
  { value: 'pending', label: 'En Attente', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmée', color: 'blue' },
  { value: 'preparing', label: 'En Préparation', color: 'indigo' },
  { value: 'ready', label: 'Prête', color: 'purple' },
  { value: 'completed', label: 'Complétée', color: 'green' },
  { value: 'cancelled', label: 'Annulée', color: 'red' },
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const AdminOrdersManager: React.FC<OrdersManagerProps> = () => {
  const { pharmacy } = usePharmacyAdmin();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; orderId: string; newStatus: string }>({ open: false, orderId: '', newStatus: '' });

  // Load orders
  useEffect(() => {
    if (!pharmacy?._id) return;
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacy?._id]);

  const loadOrders = async () => {
    if (!pharmacy?._id) return;
    try {
      setLoading(true);
      const data = await getOrders(pharmacy._id as string);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const validateStatus = (status: string): status is IOrder['status'] => {
    return VALID_STATUSES.includes(status as IOrder['status']);
  };

  const handleStatusChangeRequest = (orderId: string, newStatus: string) => {
    if (!validateStatus(newStatus)) {
      setError('Statut invalide sélectionné');
      return;
    }
    setConfirmModal({ open: true, orderId, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus } = confirmModal;
    if (!pharmacy?._id) return;
    try {
      await updateOrderStatus(pharmacy._id as string, orderId, newStatus as IOrder['status']);
      setSuccessMessage('Statut de la commande mis à jour');
      setConfirmModal({ open: false, orderId: '', newStatus: '' });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setConfirmModal({ open: false, orderId: '', newStatus: '' });
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    return colors[statusObj?.color || 'gray'] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status)?.label || status;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
        <p className="text-gray-600 mt-2">{pharmacy?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Commandes</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">En Attente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Complétées</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Revenu Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stats.revenue.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          {successMessage}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer par statut
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {ORDER_STATUSES.map(status => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Order Header */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition border-b flex items-center justify-between"
              onClick={() =>
                setExpandedOrderId(expandedOrderId === order._id ? null : order._id)
              }
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Commande #{order._id?.slice(-6).toUpperCase()}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Client: {order.userName || 'N/A'}</p>
                  <p>Date: {new Date(order.createdAt || '').toLocaleDateString('fr-DZ')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {order.total.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                </p>
                <p className="text-sm text-gray-600">{order.medications.length} article(s)</p>
              </div>
              <span className="ml-4 text-gray-400">
                {expandedOrderId === order._id ? '▼' : '▶'}
              </span>
            </div>

            {/* Order Details */}
            {expandedOrderId === order._id && (
              <div className="p-6 bg-gray-50 border-t space-y-4">
                {/* Medications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Articles</h4>
                  <div className="space-y-2 bg-white rounded p-3">
                    {order.medications.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{med.medicationName}</p>
                          <p className="text-gray-600">Quantité: {med.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {(med.price * med.quantity).toLocaleString('fr-DZ', {
                            style: 'currency',
                            currency: 'DZD'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {order.prescription?.fileName && (
                  <div className="bg-white rounded p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ordonnance</h4>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700">{order.prescription.fileName}</span>
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL}${order.prescription.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Ouvrir
                      </a>
                    </div>
                  </div>
                )}

                {/* Client Info */}
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Client:</span> {order.userName || 'N/A'}
                  </p>
                  {order.userPhone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Téléphone:</span> {order.userPhone}
                    </p>
                  )}
                </div>

                {/* Status Change */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Changer le statut</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChangeRequest(order._id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Sélectionner un statut</option>
                      {VALID_TRANSITIONS[order.status].map(statusValue => (
                        <option key={statusValue} value={statusValue}>
                          {getStatusLabel(statusValue)}
                        </option>
                      ))}
                      {VALID_TRANSITIONS[order.status].length === 0 && (
                        <option value="" disabled>Aucun changement possible</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucune commande trouvée</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Confirmer le changement de statut"
        message={`Voulez-vous vraiment changer le statut de la commande #${confirmModal.orderId?.slice(-6).toUpperCase()} vers "${getStatusLabel(confirmModal.newStatus)}" ?`}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmModal({ open: false, orderId: '', newStatus: '' })}
      />
    </div>
  );
};

export default AdminOrdersManager;
