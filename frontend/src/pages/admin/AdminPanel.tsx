import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LiaPlusSolid, LiaEditSolid, LiaTrashSolid, LiaChartLineSolid, LiaShoppingCartSolid, LiaPillsSolid, LiaBoxSolid } from 'react-icons/lia';
import { useAuthContext } from '../../features/auth';
import { useTheme } from '../../features/theme';
import { getUploadImageUrl } from '../../utils/image';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../features/ui/toast';
import type { IPharmacy } from '../../features/pharmacy/types';
import { useMedications, useStocks, useOrders, usePurchases, useAdminUsers, usePharmacyStats } from '../../features/admin/hooks/useAdmin';
import type { IMedication } from '../../features/admin/types';
import * as adminApi from '../../features/admin/api/admin';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

type TabType = 'dashboard' | 'medications' | 'orders' | 'purchases' | 'users' | 'stocks';

const CHART_COLORS = {
  emerald: '#10B981',
  blue: '#3B82F6',
  amber: '#F59E0B',
  rose: '#EF4444',
  violet: '#8B5CF6',
};

const COLORS = [CHART_COLORS.emerald, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.rose, CHART_COLORS.violet];

type MedicationFormData = Partial<IMedication> & {
  quantity?: number;
  minQuantity?: number;
};

function AdminPanel() {
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [pharmacyId, setPharmacyId] = useState<string>('');
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IMedication | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingMedication, setSavingMedication] = useState(false);
  const [medicationError, setMedicationError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteMedicationId, setDeleteMedicationId] = useState<string | null>(null);
  const [deleteMedicationName, setDeleteMedicationName] = useState<string>('');
  const [userPharmacyLoaded, setUserPharmacyLoaded] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    description: '',
    category: '',
    requiresPrescription: false,
    price: 0,
    active: true,
    quantity: 0,
    minQuantity: 0,
  });

  // Verifier l'acces
  useEffect(() => {
    if (user?.role !== 'pharmacist' && user?.role !== 'admin') {
      navigate('/auth/login');
    }
  }, [user?.role, navigate]);

  // Charger pharmacies pour admin
  useEffect(() => {
    if (user?.role === 'admin') {
      const loadPharmacies = async () => {
        try {
          const result = await adminApi.getAllPharmacies();
          setPharmacies(result.pharmacies || []);
          if (result.pharmacies?.length > 0 && !pharmacyId) {
            setPharmacyId(result.pharmacies[0]._id || '');
          }
        } catch (err) {
          console.error('Failed to load pharmacies:', err);
        }
      };
      loadPharmacies();
      console.log(pharmacyId);
    }
  }, [pharmacyId, user?.role]);

  // Charger pharmacie pour pharmacist
  useEffect(() => {
    if (user?.role !== 'pharmacist' || !user._id || pharmacyId) return;

    const fetchPharmacy = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/pharmacy/user/${user._id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          const pharmacy = result.pharmacy as IPharmacy | null;
          if (pharmacy && pharmacy._id) {
            setPharmacyId(pharmacy._id || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch user pharmacy:', err);
      }
    };

    fetchPharmacy();
      console.log(pharmacyId);

  }, [user?.role, user?._id, pharmacyId]);

  useEffect(() => {
    if (!user?._id || pharmacyId || userPharmacyLoaded) return;

    const fetchUserPharmacy = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/pharmacy/user/${user._id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          const pharmacy = result.pharmacy as IPharmacy | null;
          if (pharmacy && pharmacy._id) {
            setPharmacyId(pharmacy._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user pharmacy fallback:', err);
      } finally {
        setUserPharmacyLoaded(true);
      }
    };

    fetchUserPharmacy();
  }, [user?._id, pharmacyId, userPharmacyLoaded]);

  const { data: medications = [], isLoading: medsLoading, create: createMed, update: updateMed, remove: deleteMed } = useMedications(pharmacyId);
  const { data: stocks = [], isLoading: stockLoading, update: updateStock } = useStocks(pharmacyId);
  const { data: orders = [], isLoading: orderLoading, updateStatus: updateOrderStatus } = useOrders(pharmacyId);
  const { data: purchases = [], isLoading: purchasesLoading, updateStatus: updatePurchaseStatus } = usePurchases(pharmacyId);
  const { data: adminUsers = [], isLoading: adminUsersLoading } = useAdminUsers(pharmacyId);
  const { data: stats } = usePharmacyStats(pharmacyId);

  // Donnees pour graphs
  const ordersByDay = (orders || []).reduce((acc, order) => {
    const date = new Date(order.createdAt as string).toLocaleDateString('fr-FR', { weekday: 'short' });
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.amount += order.total;
      existing.count += 1;
    } else {
      acc.push({ date, amount: order.total, count: 1 });
    }
    return acc;
  }, [] as { date: string; amount: number; count: number }[]).slice(-7);

  const stockByCategory = (medications || []).map(med => ({
    name: med.category || 'Non catégorisé',
    quantité: stocks.find(s => s.medicationId === med._id)?.quantity || 0
  }));

  const topMedicationsByRevenue = (orders || []).flatMap(order =>
    order.medications.map(med => ({
      name: med.medicationName,
      revenue: med.price * med.quantity
    }))
  ).reduce((acc, item) => {
    const existing = acc.find(i => i.name === item.name);
    if (existing) {
      existing.revenue += item.revenue;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as { name: string; revenue: number }[])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleSaveMedication = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setMedicationError(null);

    if (!pharmacyId) {
      setMedicationError('Aucune pharmacie sélectionnée.');
      return;
    }

    if (!formData.name?.trim()) {
      setMedicationError('Le nom du médicament est requis.');
      return;
    }

    if (formData.price === undefined || typeof formData.price !== 'number' || Number.isNaN(formData.price) || formData.price < 0) {
      setMedicationError('Le prix doit être un nombre valide supérieur ou égal à 0.');
      return;
    }

    try {
      setSavingMedication(true);
      const medicationData = {
        ...formData,
        price: Number(formData.price)
      };
      if (editingItem) {
        await updateMed(editingItem._id, medicationData, photoFile || undefined);
        showToast('Médicament mis à jour avec succès', 'success');
      } else {
        await createMed(medicationData, photoFile || undefined);
        showToast('Médicament ajouté avec succès', 'success');
      }
      setShowModal(false);
      setEditingItem(null);
      setPhotoPreview('');
      setPhotoFile(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        requiresPrescription: false,
        price: 0,
        active: true,
        quantity: 0,
        minQuantity: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.';
      setMedicationError(message);
      console.error(err);
    } finally {
      setSavingMedication(false);
    }
  };

  const handleDeleteMedication = (id: string, name: string) => {
    setDeleteMedicationId(id);
    setDeleteMedicationName(name);
    setConfirmationOpen(true);
  };

  const confirmDeleteMedication = async () => {
    if (!deleteMedicationId) return;

    try {
      await deleteMed(deleteMedicationId);
      showToast('Médicament supprimé avec succès', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de supprimer le médicament.';
      showToast(message, 'error');
    } finally {
      setConfirmationOpen(false);
      setDeleteMedicationId(null);
      setDeleteMedicationName('');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (med: IMedication) => {
    setEditingItem(med);
    setFormData(med);
    if (med.photo) {
      setPhotoPreview(getUploadImageUrl(med.photo) ?? '');
    }
    setShowModal(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LiaChartLineSolid size={18} /> },
    { id: 'medications', label: 'Médicaments', icon: <LiaPillsSolid size={18} /> },
    { id: 'orders', label: 'Commandes', icon: <LiaShoppingCartSolid size={18} /> },
    { id: 'purchases', label: 'Achats', icon: <LiaBoxSolid size={18} /> },
    { id: 'users', label: 'Utilisateurs', icon: <LiaChartLineSolid size={18} /> },
    { id: 'stocks', label: 'Stocks', icon: <LiaBoxSolid size={18} /> },
  ] as const;

  const handlePharmacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPharmacyId(e.target.value);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <LiaChartLineSolid className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                {user?.role === 'admin' && pharmacies.length > 0 && (
                  <select
                    value={pharmacyId}
                    onChange={handlePharmacyChange}
                    className="mt-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500"
                  >
                    {pharmacies.map(pharm => (
                      <option key={pharm._id} value={pharm._id}>{pharm.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <Link
              to="/"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <LiaBoxSolid size={18} />
              Retour au site
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-6">

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <LiaBoxSolid className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pharmacies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pharmacies.length}</p>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <LiaPillsSolid className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Médicaments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalMedications || 0}</p>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <LiaShoppingCartSolid className="text-amber-600 dark:text-amber-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalOrders || 0}</p>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <LiaChartLineSolid className="text-rose-600 dark:text-rose-400" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenus</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.todayRevenue?.toFixed(0) || 0} Ar</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard charts */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {ordersByDay.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commandes par jour</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="date" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                    <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#F9FAFB' : '#111827'
                      }}
                    />
                    <Line type="monotone" dataKey="amount" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={{ fill: CHART_COLORS.emerald }} name="Montant (Ar)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {stockByCategory.length > 0 && (
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Stocks par catégorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stockByCategory} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#8884d8" dataKey="quantité">
                      {stockByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#F9FAFB' : '#111827'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {topMedicationsByRevenue.length > 0 && activeTab === 'dashboard' && (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} mb-6`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 5 médicaments par revenu</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMedicationsByRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis type="number" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                <YAxis type="category" dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#F9FAFB' : '#111827'
                  }}
                />
                <Bar dataKey="revenue" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Medications tab */}
        {activeTab === 'medications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Médicaments</h2>
              <button
                onClick={() => { setEditingItem(null); setPhotoPreview(''); setPhotoFile(null); setFormData({ name: '', description: '', category: '', requiresPrescription: false, price: 0, active: true, quantity: 0, minQuantity: 0 }); setShowModal(true); }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <LiaPlusSolid /> Ajouter
              </button>
            </div>

            {medsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            ) : medications.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <LiaPillsSolid className="mx-auto text-4xl mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Aucun médicament trouvé</p>
              </div>
            ) : (
              <div className={`rounded-2xl overflow-hidden shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Photo</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Catégorie</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Ordonnance</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Prix</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {medications.map(med => (
                        <tr key={med._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            {med.photo ? (
                              <img src={getUploadImageUrl(med.photo)} alt={med.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <LiaPillsSolid className="text-gray-400" size={20} />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{med.name}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{med.category || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              med.requiresPrescription
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {med.requiresPrescription ? 'Oui' : 'Non'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{med.price.toFixed(2)} Ar</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleEdit(med)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <LiaEditSolid size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteMedication(med._id, med.name)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <LiaTrashSolid size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <ConfirmModal
              open={confirmationOpen}
              title="Supprimer le médicament"
              message={`Voulez-vous vraiment supprimer ${deleteMedicationName || 'ce médicament'} ?`}
              onConfirm={confirmDeleteMedication}
              onCancel={() => {
                setConfirmationOpen(false);
                setDeleteMedicationId(null);
                setDeleteMedicationName('');
              }}
            />

            {/* Modal Ajout/Édition Médicament */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-lg shadow-2xl my-8`}>
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingItem ? 'Modifier' : 'Ajouter'} un médicament
                    </h3>
                  </div>
                  <form onSubmit={handleSaveMedication} className="p-6 space-y-5">
                    {medicationError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                        {medicationError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nom *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Catégorie *</label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prix (Ar)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        value={formData.price ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: e.target.value === '' ? undefined : parseFloat(e.target.value)
                        })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Quantité en stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          quantity: e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Seuil minimum</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minQuantity ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          minQuantity: e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        })}
                        className={`w-full px-4 py-3 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Photo</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {photoPreview && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="requiresPrescription"
                        checked={formData.requiresPrescription}
                        onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="requiresPrescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sur ordonnance
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active ?? true}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Médicament actif
                      </label>
                    </div>

                    <div className={`flex gap-3 px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setPhotoPreview('');
                          setPhotoFile(null);
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={savingMedication}
                        className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {savingMedication ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Commandes</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                theme === 'dark' ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-100 text-amber-700'
              }`}>
                {orders.length} commande{orders.length > 1 ? 's' : ''}
              </span>
            </div>

            {orderLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-32 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <LiaShoppingCartSolid className="mx-auto text-4xl mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order._id} className={`rounded-2xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Client
                        </h3>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.userName || 'Anonyme'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          {order.userPhone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Date de commande
                        </h3>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-xl" style={{backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}}>
                      <div>
                        <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          Total
                        </p>
                        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {order.total.toFixed(2)} Ar
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          Paiement
                        </p>
                        <p className={`text-lg font-bold mt-1 px-3 py-1 rounded-full text-center inline-block ${
                          order.paymentMethod === 'cash'
                            ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                            : order.paymentMethod === 'visa'
                            ? theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                            : theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {order.paymentMethod === 'cash' ? '💵 Espèces' : order.paymentMethod === 'visa' ? '💳 Visa' : '🅿️ PayPal'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                          Articles
                        </p>
                        <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.medications.length} article{order.medications.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} mb-2`}>
                        Détail des articles
                      </p>
                      <div className="space-y-1">
                        {order.medications.map((m, idx) => (
                          <p key={idx} className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                            • {m.medicationName} <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>x{m.quantity}</span> @ {m.price} Ar
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.status === 'completed' || order.status === 'ready'
                          ? theme === 'dark' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : order.status === 'cancelled'
                          ? theme === 'dark' ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-700'
                          : theme === 'dark' ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => updateOrderStatus(order._id, order.status === 'pending' ? 'confirmed' : order.status === 'confirmed' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'completed')}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors font-semibold"
                      >
                        {order.status === 'pending' ? 'Confirmer' : order.status === 'confirmed' ? 'En préparation' : order.status === 'preparing' ? 'Prêt' : 'Terminé'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Achats</h2>

            {purchasesLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-32 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <LiaBoxSolid className="mx-auto text-4xl mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Aucun achat enregistré</p>
              </div>
            ) : (
              <div className={`rounded-2xl overflow-hidden shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fournisseur</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Articles</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {purchases.map(purchase => (
                        <tr key={purchase._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{purchase.supplierName || 'Fournisseur'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{purchase.supplierPhone || ''}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {purchase.medicines.map(m => `${m.medicineName} x${m.quantity}`).join(', ')}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{purchase.total.toFixed(2)} Ar</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              purchase.status === 'received'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : purchase.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => updatePurchaseStatus(purchase._id, purchase.status === 'pending' ? 'confirmed' : 'received')}
                              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors"
                            >
                              {purchase.status === 'pending' ? 'Confirmer' : 'Marquer reçu'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h2>

            {adminUsersLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-24 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            ) : adminUsers.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur administratif trouvé</p>
              </div>
            ) : (
              <div className={`rounded-2xl overflow-hidden shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rôle</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Permissions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {adminUsers.map(admin => (
                        <tr key={admin._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{admin.user.username}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{admin.user.email}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{admin.user.role}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {Object.entries(admin.permissions)
                              .filter(([, value]) => value)
                              .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
                              .join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stocks tab */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stocks</h2>

            {stockLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            ) : stocks.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <LiaBoxSolid className="mx-auto text-4xl mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Aucun stock trouvé</p>
              </div>
            ) : (
              <div className={`rounded-2xl overflow-hidden shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Médicament</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Quantité</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Min</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Statut</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {stocks.map(stock => {
                        const isLow = stock.quantity < stock.minQuantity;
                        return (
                          <tr key={stock._id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{stock.medicationName}</td>
                            <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{stock.quantity}</td>
                            <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{stock.minQuantity}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isLow
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {isLow ? 'Faible' : 'OK'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <input
                                type="number"
                                defaultValue={stock.quantity}
                                onBlur={(e) => updateStock(stock.medicationId, parseInt(e.target.value))}
                                className={`w-24 px-3 py-2 text-right rounded-lg border ${
                                  theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
