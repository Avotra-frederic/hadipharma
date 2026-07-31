import { useAuthContext } from '../../features/auth';
import { useToast } from '../../features/ui/toast/ToastContext';
import { useState } from 'react';
import { FiChevronLeft, FiCreditCard, FiUser, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

function ProfileSettings() {
  const { user, updateUserProfile, deleteUserAccount } = useAuthContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const sections = [
    {
      id: 'paiement',
      icon: <FiCreditCard className="text-blue-500" />,
      title: 'Modes de paiement',
      description: 'Gérer vos cartes et méthodes de paiement',
      link: '/profil/paiements',
    },
    {
      id: 'profil',
      icon: <FiUser className="text-purple-500" />,
      title: 'Modifier mon profil',
      description: 'Nom d\'utilisateur, avatar',
      action: true,
    },
    {
      id: 'donnees',
      icon: <FiEye className="text-emerald-500" />,
      title: 'Gérer mes données personnelles',
      description: 'Données personnelles et confidentialité',
      link: '/profil/parametres/confidentialite',
    },
    {
      id: 'suppression',
      icon: <FiTrash2 className="text-rose-500" />,
      title: 'Supprimer / Désactiver mon compte',
      description: 'Supprimer définitivement votre compte',
      action: true,
    },
  ];

  const handleUpdateProfile = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setShowEditProfile(false);
      return;
    }
    try {
      await updateUserProfile({ username: newUsername });
      showToast('Profil mis à jour avec succès', 'success');
      setShowEditProfile(false);
    } catch {
      showToast('Erreur lors de la mise à jour du profil', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      showToast('Texte de confirmation incorrect', 'error');
      return;
    }
    try {
      await deleteUserAccount();
      navigate('/auth/login');
    } catch {
      showToast('Erreur lors de la suppression du compte', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profil"
            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            <FiChevronLeft size={22} />
          </Link>
          <h1 className="text-2xl font-bold">Paramètres</h1>
        </div>

        <div className="space-y-4">
          {sections.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
                {item.link ? (
                  <Link to={item.link} className="text-slate-400 hover:text-slate-600">
                    <FiChevronLeft className="rotate-180" size={18} />
                  </Link>
                ) : (
                  <button
                    onClick={item.id === 'profil' ? () => setShowEditProfile(true) : () => setShowDeleteConfirm(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      item.id === 'suppression'
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                        : 'bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.id === 'profil' ? 'Modifier' : 'Supprimer'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/profil/parametres/securite"
            className="block p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-900/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                  <FiEyeOff className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Sécurité</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Mot de passe et authentification</p>
                </div>
              </div>
              <FiChevronLeft className="rotate-180 text-slate-400" size={18} />
            </div>
          </Link>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6">
          <div className="absolute inset-0" onClick={() => setShowEditProfile(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Modifier le profil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nom d'utilisateur"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  className="flex-1 py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6">
          <div className="absolute inset-0" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-rose-600 dark:text-rose-400">Supprimer le compte</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Pour confirmer la suppression, tapez 'SUPPRIMER' dans le champ ci-dessous.</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez SUPPRIMER"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl font-semibold bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;
