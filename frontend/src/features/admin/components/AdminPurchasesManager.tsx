import React, { useState, useEffect } from 'react';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import { getPurchases, updatePurchaseStatus } from '../api/admin';
import type { IPurchase } from '../types';

interface PurchasesManagerProps {
  onNavigate?: (section: string) => void;
}

const PURCHASE_STATUSES = [
  { value: 'pending', label: 'En Attente', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmée', color: 'blue' },
  { value: 'received', label: 'Reçue', color: 'green' },
  { value: 'cancelled', label: 'Annulée', color: 'red' },
];

export const AdminPurchasesManager: React.FC<PurchasesManagerProps> = () => {
  const { pharmacy } = usePharmacyAdmin();
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);

  // Load purchases
  useEffect(() => {
    if (!pharmacy?._id) return;
    loadPurchases();
  }, [pharmacy?._id]);

  const loadPurchases = async () => {
    if (!pharmacy?._id) return;
    try {
      setLoading(true);
      const data = await getPurchases(pharmacy._id as string);
      setPurchases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (purchaseId: string, newStatus: IPurchase['status']) => {
    if (!pharmacy?._id) return;
    try {
      await updatePurchaseStatus(pharmacy._id as string, purchaseId, newStatus);
      setSuccessMessage('Statut de l\'achat mis à jour');
      await loadPurchases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const filteredPurchases = filterStatus
    ? purchases.filter(p => p.status === filterStatus)
    : purchases;

  const getStatusColor = (status: string) => {
    const statusObj = PURCHASE_STATUSES.find(s => s.value === status);
    const colors: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
    };
    return colors[statusObj?.color || 'gray'] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return PURCHASE_STATUSES.find(s => s.value === status)?.label || status;
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    received: purchases.filter(p => p.status === 'received').length,
    totalExpense: purchases
      .filter(p => p.status === 'received')
      .reduce((sum, p) => sum + p.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Achats/Factures</h1>
        <p className="text-gray-600 mt-2">{pharmacy?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Achats</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">En Attente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Reçus</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{stats.received}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Dépense Totale</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {stats.totalExpense.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
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
          {PURCHASE_STATUSES.map(status => (
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

      {/* Purchases List */}
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <div key={purchase._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Purchase Header */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition border-b flex items-center justify-between"
              onClick={() =>
                setExpandedPurchaseId(expandedPurchaseId === purchase._id ? null : purchase._id)
              }
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Achat #{purchase._id?.slice(-6).toUpperCase()}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                    {getStatusLabel(purchase.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Fournisseur: {purchase.supplier || 'N/A'}</p>
                  <p>Date: {new Date(purchase.purchaseDate || purchase.createdAt || '').toLocaleDateString('fr-DZ')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  {purchase.totalAmount.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}
                </p>
                <p className="text-sm text-gray-600">{purchase.medicines.length} article(s)</p>
              </div>
              <span className="ml-4 text-gray-400">
                {expandedPurchaseId === purchase._id ? '▼' : '▶'}
              </span>
            </div>

            {/* Purchase Details */}
            {expandedPurchaseId === purchase._id && (
              <div className="p-6 bg-gray-50 border-t space-y-4">
                {/* Medicines */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Articles Achetés</h4>
                  <div className="space-y-2 bg-white rounded p-3">
                    {purchase.medicines.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                        <div>
                          <p className="font-medium text-gray-900">{med.medicine || 'N/A'}</p>
                          <p className="text-gray-600">Quantité: {med.quantity}</p>
                          <p className="text-gray-600">Prix unitaire: {med.unitPrice.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {(med.unitPrice * med.quantity).toLocaleString('fr-DZ', {
                            style: 'currency',
                            currency: 'DZD'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier Info */}
                {purchase.supplier && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fournisseur:</span> {purchase.supplier}
                    </p>
                  </div>
                )}

                {/* Status Change */}
                {purchase.status !== 'received' && purchase.status !== 'cancelled' && (
                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Changer le statut</p>
                    <select
                      value={purchase.status}
                      onChange={(e) => handleStatusChange(purchase._id, e.target.value as IPurchase['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PURCHASE_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Facture Button */}
                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    📄 Télécharger la Facture
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun achat trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AdminPurchasesManager;
