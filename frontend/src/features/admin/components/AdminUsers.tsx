import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LiaPlusSolid, LiaTrashSolid } from 'react-icons/lia';
import { usePharmacyAdmin } from '../hooks/usePharmacyAdmin';
import {
  addPharmacyAdmin,
  getPharmacyAdmins,
  removePharmacyAdmin,
  togglePharmacyAdminActive,
  updatePharmacyAdminPermissions,
} from '../api/admin';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useToast } from '../../../features/ui/toast';
import { useTheme } from '../../../features/theme';

export interface IPharmacyPermissions {
  [key: string]: boolean;
  manageMedicines: boolean;
  manageStocks: boolean;
  manageOrders: boolean;
  managePurchases: boolean;
  viewStatistics: boolean;
  manageUsers: boolean;
  manageSettings: boolean;
}

export interface IPharmacyAdmin {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: 'client' | 'admin' | 'pharmacist' | string;
  };
  permissions: IPharmacyPermissions;
  active?: boolean;
}

interface NewAdminForm {
  username: string;
  email: string;
  password: string;
  role: 'pharmacist' | 'admin';
}

interface AdminUsersProps {
  pharmacyId?: string;
  canManageUsers?: boolean;
}

const objectIdPattern = /^[a-f\d]{24}$/i;

const permissionLabels: Record<keyof IPharmacyPermissions, string> = {
  manageMedicines: 'Médicaments',
  manageStocks: 'Stocks',
  manageOrders: 'Commandes',
  managePurchases: 'Achats',
  viewStatistics: 'Statistiques',
  manageUsers: 'Utilisateurs',
  manageSettings: 'Paramètres',
};

const defaultPermissions: IPharmacyPermissions = {
  manageMedicines: true,
  manageStocks: true,
  manageOrders: true,
  managePurchases: false,
  viewStatistics: true,
  manageUsers: false,
  manageSettings: false,
};

const emptyForm: NewAdminForm = {
  username: '',
  email: '',
  password: '',
  role: 'pharmacist',
};

export const AdminUsers: React.FC<AdminUsersProps> = ({ pharmacyId, canManageUsers }) => {
  const { theme } = useTheme();
  const { pharmacy, permissions: currentAdminPermissions, loading: pharmacyLoading } = usePharmacyAdmin({
    skipPermissionsFetch: Boolean(pharmacyId),
  });
  const effectivePharmacyId = pharmacyId || pharmacy?._id || '';
  const hasManageUsersAccess = canManageUsers ?? Boolean(currentAdminPermissions?.manageUsers);
  const isDark = theme === 'dark';

  const [admins, setAdmins] = useState<IPharmacyAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState<NewAdminForm>(emptyForm);
  const [selectedPermissions, setSelectedPermissions] = useState<IPharmacyPermissions>(defaultPermissions);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [removeCandidate, setRemoveCandidate] = useState<IPharmacyAdmin | null>(null);
  const { showToast } = useToast();

  const validPharmacyId = useMemo(
    () => (objectIdPattern.test(effectivePharmacyId) ? effectivePharmacyId : ''),
    [effectivePharmacyId]
  );

  const panelClass = isDark
    ? 'border-gray-700 bg-gray-800 text-white'
    : 'border-gray-100 bg-white text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark
    ? 'border-gray-700 bg-gray-900 text-white placeholder:text-gray-500 focus:ring-emerald-500'
    : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-emerald-500';

  const resetForm = () => {
    setNewAdmin(emptyForm);
    setSelectedPermissions(defaultPermissions);
  };

  const loadAdmins = useCallback(async () => {
    if (!validPharmacyId) return;

    try {
      setLoading(true);
      const data = await getPharmacyAdmins(validPharmacyId) as unknown as IPharmacyAdmin[];
      setAdmins(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  },[showToast, validPharmacyId]);

  useEffect(() => {
    if (validPharmacyId && hasManageUsersAccess) {
      loadAdmins();
    }
  }, [validPharmacyId, hasManageUsersAccess, loadAdmins]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPharmacyId) {
      showToast('Pharmacie introuvable pour cette action', 'error');
      return;
    }

    const username = newAdmin.username.trim();
    const email = newAdmin.email.trim().toLowerCase();

    if (!username || !email || newAdmin.password.length < 6) {
      showToast('Nom, email et mot de passe de 6 caractères minimum requis', 'error');
      return;
    }

    try {
      setSaving(true);
      await addPharmacyAdmin(validPharmacyId, {
        ...newAdmin,
        username,
        email,
        permissions: selectedPermissions,
      });
      showToast('Utilisateur ajouté avec succès', 'success');
      setShowAddForm(false);
      resetForm();
      await loadAdmins();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = async (adminId: string, key: keyof IPharmacyPermissions, value: boolean) => {
    if (!validPharmacyId) return;
    const admin = admins.find(a => a._id === adminId);
    if (!admin) return;

    const updatedPermissions = { ...admin.permissions, [key]: value };

    try {
      await updatePharmacyAdminPermissions(validPharmacyId, adminId, updatedPermissions);
      setAdmins(prev => prev.map(a => a._id === adminId ? { ...a, permissions: updatedPermissions } : a));
      showToast('Permissions mises à jour', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des permissions', 'error');
    }
  };

  const handleToggleActive = async (admin: IPharmacyAdmin) => {
    if (!validPharmacyId) return;
    const nextActive = admin.active === false;

    try {
      await togglePharmacyAdminActive(validPharmacyId, admin._id, nextActive);
      setAdmins(prev => prev.map(item => item._id === admin._id ? { ...item, active: nextActive } : item));
      showToast(nextActive ? 'Compte activé' : 'Compte désactivé', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors du changement de statut', 'error');
    }
  };

  const handleRemoveClick = (admin: IPharmacyAdmin) => {
    setRemoveCandidate(admin);
    setConfirmationOpen(true);
  };

  const confirmRemove = async () => {
    if (!validPharmacyId || !removeCandidate) return;

    try {
      await removePharmacyAdmin(validPharmacyId, removeCandidate._id);
      showToast('Utilisateur retiré', 'success');
      await loadAdmins();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression', 'error');
    } finally {
      setConfirmationOpen(false);
      setRemoveCandidate(null);
    }
  };

  if (pharmacyLoading && !pharmacyId) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-20 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
        ))}
      </div>
    );
  }

  if (!hasManageUsersAccess) {
    return (
      <div className={`rounded-2xl border-2 border-dashed py-12 text-center ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        Vous n'avez pas la permission de gérer les utilisateurs de cette pharmacie.
      </div>
    );
  }

  if (!validPharmacyId) {
    return (
      <div className={`rounded-2xl border-2 border-dashed py-12 text-center ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        Sélectionnez une pharmacie avant de gérer ses utilisateurs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Utilisateurs</h2>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>Gérez les accès, permissions et statuts des comptes de cette pharmacie.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <LiaPlusSolid size={18} />
            Ajouter
          </button>
        )}
      </div>

      {showAddForm && (
        <div className={`rounded-2xl border p-5 shadow-sm ${panelClass}`}>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nom utilisateur</label>
                <input
                  type="text"
                  required
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, username: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass}`}
                  placeholder="Nom du collaborateur"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass}`}
                  placeholder="exemple@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass}`}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Rôle</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value as NewAdminForm['role'] }))}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${inputClass}`}
                >
                  <option value="pharmacist">Pharmacien</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium">Permissions</span>
              <div className={`grid gap-2 rounded-2xl border p-3 sm:grid-cols-2 lg:grid-cols-4 ${isDark ? 'border-gray-700 bg-gray-900/60' : 'border-gray-100 bg-gray-50'}`}>
                {Object.keys(defaultPermissions).map((perm) => (
                  <label key={perm} className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions[perm]}
                      onChange={(e) => setSelectedPermissions(prev => ({ ...prev, [perm]: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={selectedPermissions[perm] ? 'font-medium' : mutedTextClass}>
                      {permissionLabels[perm as keyof IPharmacyPermissions]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`overflow-hidden rounded-2xl border shadow-sm ${panelClass}`}>
        {loading ? (
          <div className="animate-pulse space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-14 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className={`py-12 text-center ${mutedTextClass}`}>Aucun utilisateur administratif trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Permissions</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {admins.map((admin) => (
                  <tr key={admin._id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                          {(admin.user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{admin.user.username}</div>
                          <div className={`text-sm ${mutedTextClass}`}>{admin.user.email}</div>
                          <div className={`text-xs capitalize ${mutedTextClass}`}>{admin.user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${admin.active === false ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {admin.active === false ? 'Désactivé' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[320px] flex-wrap gap-2">
                        {Object.entries(defaultPermissions).map(([key]) => (
                          <label key={key} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            <input
                              type="checkbox"
                              checked={Boolean(admin.permissions[key])}
                              onChange={(e) => handlePermissionChange(admin._id, key as keyof IPharmacyPermissions, e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            {permissionLabels[key as keyof IPharmacyPermissions]}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(admin)}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${admin.active === false ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'}`}
                        >
                          {admin.active === false ? 'Activer' : 'Désactiver'}
                        </button>
                        <button
                          onClick={() => handleRemoveClick(admin)}
                          className="inline-flex items-center justify-center rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400"
                          aria-label="Révoquer"
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
        )}
      </div>

      <ConfirmModal
        open={confirmationOpen}
        title="Révoquer l'accès"
        message={`Êtes-vous sûr de vouloir retirer les accès de gestion à ${removeCandidate?.user.username || 'cet utilisateur'} ?`}
        onConfirm={confirmRemove}
        onCancel={() => {
          setConfirmationOpen(false);
          setRemoveCandidate(null);
        }}
      />
    </div>
  );
};

export default AdminUsers;
