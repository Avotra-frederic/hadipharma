import { FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function SettingsNotifications() {
  const preferences = [
    { label: 'Notifications par email', checked: true },
    { label: 'Notifications SMS', checked: false },
    { label: 'Notifications push', checked: true },
    { label: 'Alertes promotions', checked: false },
  ];
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
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="space-y-4">
          {preferences.map((p, i) => (
            <label key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700">
              <span className="text-sm font-bold text-slate-700 dark:text-gray-200">{p.label}</span>
              <input type="checkbox" defaultChecked={p.checked} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsNotifications;
