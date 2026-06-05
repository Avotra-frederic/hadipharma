import React, { useState, useEffect } from 'react';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import { getPharmacyStats } from '../api/admin';
import type { IPharmacyStats } from '../types';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { pharmacy, loading, isPharmacyAdmin } = usePharmacyAdmin();
  const [stats, setStats] = useState<IPharmacyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!pharmacy?._id) return;

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getPharmacyStats(pharmacy._id as string);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [pharmacy?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isPharmacyAdmin || !pharmacy) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Accès Refusé</h2>
        <p className="text-red-600">
          Vous devez être propriétaire d'une pharmacie pour accéder au panel d'administration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
        <p className="text-gray-600">Bienvenue, {pharmacy.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Commandes Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {statsLoading ? '...' : stats?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Commandes en Attente</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {statsLoading ? '...' : stats?.pendingOrders || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Medications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Médicaments</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {statsLoading ? '...' : stats?.totalMedications || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.452a6 6 0 00-5.036 0l-2.387.452a2 2 0 00-1.022.547m19.5-3.405a23.76 23.76 0 01-1.496 4.422m-3.084 0a23.75 23.75 0 01-5.396-6A23.75 23.75 0 0118.904 9m-1.084 12.93a23.75 23.75 0 01-5.313-3.476M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Stock Faible</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {statsLoading ? '...' : stats?.lowStockCount || 0}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-2v-2m0-4v2m0-4l2-2m-2 2l-2-2m2 2l2 2m-2-2l-2 2M7 10h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Revenu d'aujourd'hui</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {statsLoading ? '...' : `${stats?.todayRevenue?.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' }) || '0 DZD'}`}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('medicines')}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 text-center transition"
        >
          <div className="text-3xl mb-2">💊</div>
          <h3 className="font-semibold text-gray-900">Gérer Médicaments</h3>
          <p className="text-sm text-gray-600 mt-1">Ajouter, modifier ou supprimer</p>
        </button>

        <button
          onClick={() => onNavigate('stock')}
          className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-6 text-center transition"
        >
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-semibold text-gray-900">Gérer Stock</h3>
          <p className="text-sm text-gray-600 mt-1">Vérifier et mettre à jour</p>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-6 text-center transition"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-900">Gérer Commandes</h3>
          <p className="text-sm text-gray-600 mt-1">Voir et mettre à jour</p>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
