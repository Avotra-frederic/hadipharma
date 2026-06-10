import React, { useState, useEffect, useCallback } from 'react';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import { getStocks, updateStock } from '../api/admin';
import type { IStock } from '../types';

interface StockManagerProps {
  onNavigate?: (section: string) => void;
}

export const AdminStockManager: React.FC<StockManagerProps> = () => {
  const { pharmacy } = usePharmacyAdmin();
  const [stocks, setStocks] = useState<IStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByLow, setFilterByLow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const loadStocks = useCallback(async () => {
    if (!pharmacy?._id) return;
    try {
      setLoading(true);
      const data = await getStocks(pharmacy._id as string);
      setStocks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [pharmacy?._id]);

  useEffect(() => {
    if (!pharmacy?._id) return;
    loadStocks();
  }, [pharmacy?._id, loadStocks]);

  const handleEditStart = (stock: IStock) => {
    setEditingId(stock._id);
    setEditValue(stock.quantity);
  };

  const handleEditSave = async (stock: IStock) => {
    if (!pharmacy?._id) return;
    try {
      await updateStock(pharmacy._id as string, stock.medicationId, editValue);
      setSuccessMessage('Stock mis à jour');
      setEditingId(null);
      await loadStocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.medicationName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = !filterByLow || stock.quantity < stock.minQuantity;
    return matchesSearch && matchesFilter;
  });

  if (loading && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  const lowStockCount = stocks.filter(s => s.quantity < s.minQuantity).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion du Stock</h1>
        <p className="text-gray-600 mt-2">{pharmacy?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Produits</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stocks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Stock Faible</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Quantité Totale</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stocks.reduce((sum, s) => sum + s.quantity, 0)}
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

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Rechercher par nom de médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterByLow}
              onChange={(e) => setFilterByLow(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Afficher seulement le stock faible
            </span>
          </label>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Médicament</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantité Actuelle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantité Min.</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => {
              const isLowStock = stock.quantity < stock.minQuantity;
              const isEditing = editingId === stock._id;
              return (
                <tr key={stock._id} className={isLowStock ? 'bg-red-50' : 'bg-white border-b hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {stock.medicationName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      stock.quantity
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {stock.minQuantity}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {isLowStock ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ⚠️ Stock Faible
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSave(stock)}
                          className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-medium"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-medium"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(stock)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs font-medium"
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Aucun stock trouvé</p>
        </div>
      )}
    </div>
  );
};

export default AdminStockManager;
