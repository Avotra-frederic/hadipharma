import { useState, useEffect, useCallback } from 'react';
import { LiaUsersSolid, LiaChartLineSolid, LiaCalendarSolid } from 'react-icons/lia';
import { useTheme } from '../../features/theme';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../features/ui/toast';
import { Link } from 'react-router-dom';

type TabType = 'dashboard' | 'pharmacies' | 'subscriptions' | 'users';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ISuperAdminStats = {
  totalPharmacies: number;
  totalAdmins: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingSubscriptions: number;
  monthlySubscriptionRevenue: number;
  pharmacies: Array<{
    _id: string;
    name: string;
    isActive: boolean;
    subscriptionEndDate?: string;
    features?: string[];
    address?: string;
    phone?: string;
  }>;
};

type IPharmacy = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  subscriptionEndDate?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type IUser = {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

function SuperAdminPanel() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<ISuperAdminStats | null>(null);
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacy | null>(null);
  const [actionType, setActionType] = useState<'toggle' | 'delete' | null>(null);
  const [subUsers, setSubUsers] = useState<IUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<IPharmacy[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedPharm, setSelectedPharm] = useState<IPharmacy | null>(null);
  const [subEndDate, setSubEndDate] = useState('');
  const [subError, setSubError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/stats`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      setStats(await res.json());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur stats', 'error');
    }
  }, [showToast]);

  const fetchPharmacies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/pharmacies`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch pharmacies');
      const data = await res.json();
      setPharmacies(data.pharmacies || data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur pharmacies', 'error');
    }
  }, [showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/users`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setSubUsers(data.users || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur utilisateurs', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPharmacies()]);
      setLoading(false);
    };
    load();
  }, [fetchStats, fetchPharmacies]);

  useEffect(() => {
    if (activeTab === 'pharmacies') {
      fetchPharmacies();
    }
  }, [activeTab, fetchPharmacies]);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      setSubLoading(true);
      fetchPharmacies().finally(() => setSubLoading(false));
    }
  }, [activeTab, fetchPharmacies]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const handleToggle = async (pharmacy: IPharmacy) => {
    setSelectedPharmacy(pharmacy);
    setActionType('toggle');
    setConfirmationOpen(true);
  };

  const handleUserToggle = async (u: IUser) => {
    setActionLoading(u._id);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${u._id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(`Utilisateur ${u.isActive ? 'désactivé' : 'activé'}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserDelete = async (u: IUser) => {
    if (!confirm(`Supprimer l'utilisateur "${u.username}" ?`)) return;
    setActionLoading(u._id);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/users/${u._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Action failed');
      showToast('Utilisateur supprimé', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmAction = async () => {
    if (!selectedPharmacy || !actionType) return;
    setActionLoading(selectedPharmacy._id);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/pharmacies/${selectedPharmacy._id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Action failed');
      showToast(`Pharmacie ${selectedPharmacy.isActive ? 'désactivée' : 'activée'}`, 'success');
      await Promise.all([fetchPharmacies(), fetchStats()]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setActionLoading(null);
      setConfirmationOpen(false);
      setSelectedPharmacy(null);
      setActionType(null);
    }
  };


  const openSubscriptionModal = (pharm: IPharmacy) => {
    setSelectedPharm(pharm);
    setSubEndDate(pharm.subscriptionEndDate || '');
    setSubError(null);
  };

  const saveSubscription = async () => {
    if (!selectedPharm) return;
    setSubError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/pharmacies/${selectedPharm._id}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ endDate: subEndDate ? new Date(subEndDate).toISOString() : null }),
      });
      if (!res.ok) throw new Error('Failed to update subscription');
      showToast('Abonnement mis à jour', 'success');
      setSelectedPharm(null);
      setSubscriptions((prev) =>
        prev.map((p) => (p._id === selectedPharm._id ? { ...p, subscriptionEndDate: subEndDate || undefined } : p))
      );
      fetchStats();
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LiaChartLineSolid size={18} /> },
    { id: 'pharmacies', label: 'Pharmacies', icon: <LiaUsersSolid size={18} /> },
    { id: 'subscriptions', label: 'Abonnements', icon: <LiaCalendarSolid size={18} /> },
    { id: 'users', label: 'Utilisateurs', icon: <LiaUsersSolid size={18} /> },
  ];

  const panelClass = isDark
    ? 'border-gray-700 bg-gray-800 text-white'
    : 'border-gray-100 bg-white text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark
    ? 'border-gray-700 bg-gray-900 text-white focus:ring-emerald-500'
    : 'border-gray-200 bg-white text-gray-900 focus:ring-emerald-500';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <LiaUsersSolid className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Panel</h1>
                <p className={`text-sm ${mutedTextClass}`}>Gestion globale des pharmacies</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              ← Retour au site
            </Link>
          </div>
        </div>
      </header>

      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`rounded-2xl p-6 shadow-sm border ${panelClass}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <LiaChartLineSolid className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Abonnements en attente</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingSubscriptions ?? 0}</p>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl p-6 shadow-sm border ${panelClass}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <LiaUsersSolid className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Revenu mensuel abonnements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats?.monthlySubscriptionRevenue ?? 0).toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
              <p className={`text-sm ${mutedTextClass}`}>50 000 € / pharmacie / mois</p>
            </div>
            <div className={`rounded-2xl p-6 shadow-sm border ${panelClass}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <LiaUsersSolid className="text-violet-600 dark:text-violet-400" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Pharmacies actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats?.pharmacies || []).filter((p) => p.isActive !== false).length}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${mutedTextClass}`}>sur {stats?.pharmacies?.length || 0} totales</p>
            </div>
          </div>
        )}

        {activeTab === 'pharmacies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pharmacies</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {pharmacies.length}
              </span>
            </div>

            <div className={`rounded-2xl overflow-hidden shadow-sm border ${panelClass}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Pharmacie</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Téléphone</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {pharmacies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={`py-12 text-center ${mutedTextClass}`}>
                          Aucune pharmacie enregistrée
                        </td>
                      </tr>
                    ) : (
                      pharmacies.map((pharm) => (
                        <tr key={pharm._id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{pharm.name}</p>
                            <p className={`text-sm ${mutedTextClass}`}>{pharm.address}</p>
                          </td>
                          <td className={`px-6 py-4 text-sm text-gray-600 dark:text-gray-300`}>{pharm.phone || '-'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              pharm.isActive !== false
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}>
                              {pharm.isActive !== false ? 'Active' : 'Désactivée'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleToggle(pharm)}
                              disabled={actionLoading === pharm._id}
                              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                                pharm.isActive !== false
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                              }`}
                            >
                              {pharm.isActive !== false ? 'Désactiver' : 'Activer'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Abonnements</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {subscriptions.length}
              </span>
            </div>

            <div className={`rounded-2xl overflow-hidden shadow-sm border ${panelClass}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Pharmacie</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Expire le</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {subLoading ? (
                      <tr>
                        <td colSpan={4} className={`py-12 text-center ${mutedTextClass}`}>Chargement...</td>
                      </tr>
                    ) : subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={`py-12 text-center ${mutedTextClass}`}>
                          Aucune pharmacie enregistrée
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((pharm) => {
                        const isSubActive = pharm.subscriptionEndDate ? new Date(pharm.subscriptionEndDate) >= new Date() : false;
                        return (
                          <tr key={pharm._id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900 dark:text-white">{pharm.name}</p>
                              <p className={`text-sm ${mutedTextClass}`}>{pharm.address}</p>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                              {pharm.subscriptionEndDate ? new Date(pharm.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Non défini'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isSubActive
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {isSubActive ? 'Actif' : 'Expiré'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => openSubscriptionModal(pharm)}
                                className="rounded-xl px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
                              >
                                Gérer
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {subUsers.length}
              </span>
            </div>

            <div className={`rounded-2xl overflow-hidden shadow-sm border ${panelClass}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Nom</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Rôle</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {subUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={`py-12 text-center ${mutedTextClass}`}>
                          Aucun utilisateur enregistré
                        </td>
                      </tr>
                    ) : (
                      subUsers.map((u) => (
                        <tr key={u._id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{u.username}</p>
                          </td>
                          <td className={`px-6 py-4 text-sm text-gray-600 dark:text-gray-300`}>{u.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              u.role === 'admin'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : u.role === 'pharmacist'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                            }`}>
                              {u.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUserToggle(u)}
                                disabled={actionLoading === u._id}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                                  u.isActive
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}
                              >
                                {u.isActive ? 'Désactiver' : 'Activer'}
                              </button>
                              <button
                                onClick={() => handleUserDelete(u)}
                                disabled={actionLoading === u._id}
                                className="rounded-xl px-3 py-2 text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 disabled:opacity-60"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPharm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Gérer l'abonnement - {selectedPharm.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date de fin d'abonnement
                </label>
                <input
                  type="date"
                  value={subEndDate}
                  onChange={(e) => setSubEndDate(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 border ${inputClass}`}
                />
              </div>
              {subError && <p className="text-rose-600 text-sm">{subError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPharm(null)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={saveSubscription}
                  className="flex-1 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmationOpen}
        title={actionType === 'toggle' ? (selectedPharmacy?.isActive !== false ? 'Désactiver la pharmacie' : 'Activer la pharmacie') : 'Action de confirmation'}
        message={
          actionType === 'toggle'
            ? `Êtes-vous sûr de vouloir ${selectedPharmacy?.isActive !== false ? 'désactiver' : 'activer'} la pharmacie "${selectedPharmacy?.name}" ?`
            : 'Confirmer cette action ?'
        }
        onConfirm={confirmAction}
        onCancel={() => {
          setConfirmationOpen(false);
          setSelectedPharmacy(null);
          setActionType(null);
        }}
      />
    </div>
  );
}

export default SuperAdminPanel;
