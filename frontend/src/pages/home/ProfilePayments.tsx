import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfilePayments = () => {
  const { user } = useAuthContext();
  const payments = [
    { id: 'PM-001', method: 'Carte Visa', detail: '•••• 1234', expires: '12/26' },
    { id: 'PM-002', method: 'Mobile Money', detail: '034 12 345 67' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profil"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <FiChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Modes de paiement</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gérez vos méthodes de paiement enregistrées pour des achats plus rapides.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{payment.method}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{payment.detail}</p>
                </div>
                {payment.expires && (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Expire {payment.expires}
                  </span>
                )}
              </div>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Enregistré par {user?.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePayments;
