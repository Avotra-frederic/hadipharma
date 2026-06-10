import { useState } from 'react';
import { useAuthContext } from '../../features/auth';
import { FiChevronLeft, FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function SettingsPrivacy() {
  const { user, updateUserProfile } = useAuthContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdatePrivacy = async (field: 'username' | 'email', value: string) => {
    try {
      await updateUserProfile({ [field]: value });
      alert(`${field === 'username' ? 'Nom d\'utilisateur' : 'Email'} mis à jour avec succès`);
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user?._id}/export`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mes-donnees-personnelles.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export non disponible pour le moment');
      }
    } catch {
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profil/parametres"
            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            <FiChevronLeft size={22} />
          </Link>
          <h1 className="text-2xl font-bold">Confidentialité</h1>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                <FiEye />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Données personnelles</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Gérer vos données et préférences de confidentialité</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-gray-400">Nom d'utilisateur</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">{user?.username}</p>
                </div>
                <button
                  onClick={() => {
                    const newName = prompt('Nouveau nom d\'utilisateur:', user?.username);
                    if (newName && newName !== user?.username) handleUpdatePrivacy('username', newName);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                >
                  Modifier
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    const newEmail = prompt('Nouveau email:', user?.email);
                    if (newEmail && newEmail !== user?.email) handleUpdatePrivacy('email', newEmail);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                  <FiDownload className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Exporter mes données</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Télécharger une copie de vos données personnelles</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50"
              >
                {isExporting ? 'Export...' : 'Exporter'}
              </button>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30">
                <FiTrash2 className="text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Supprimer mon compte</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Cette action est irréversible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPrivacy;
