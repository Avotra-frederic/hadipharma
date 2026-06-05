import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfileAddresses = () => {
  const { user } = useAuthContext();
  const addresses = [
    { id: 'AD-001', title: 'Domicile', address: '123 Rue de la Pharmacie, Antananarivo' },
    { id: 'AD-002', title: 'Travail', address: '456 Avenue de l’Indépendance, Antananarivo' },
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
            <h1 className="text-3xl font-bold">Adresses de livraison</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gérez vos adresses de livraison pour recevoir vos médicaments rapidement.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{address.title}</h2>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Livraison principale</span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{address.address}</p>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Utilisateur : {user?.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileAddresses;
