import { useState } from 'react';
import { FiChevronLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function SettingsSecurity() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    alert('Fonctionnalité de changement de mot de passe à implémenter côté backend');
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
          <h1 className="text-2xl font-bold">Sécurité</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                <FiLock />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Modifier le mot de passe</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Mettre à jour votre mot de passe</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Mot de passe actuel"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Nouveau mot de passe</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Confirmer le mot de passe</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700"
              >
                {showPasswords ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                {showPasswords ? 'Masquer' : 'Afficher'} les mots de passe
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Mettre à jour le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsSecurity;
