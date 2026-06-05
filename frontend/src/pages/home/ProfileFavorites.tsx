import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfileFavorites = () => {
  const { user } = useAuthContext();
  const favorites = [
    { id: 'MED-001', name: 'Aspirine', description: 'Soulage rapidement la douleur' },
    { id: 'MED-002', name: 'Doliprane', description: 'Paracétamol 500mg' },
    { id: 'MED-003', name: 'Biafine', description: 'Crème apaisante' },
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
            <h1 className="text-3xl font-bold">Médicaments favoris</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Vos médicaments favoris sont listés ici pour un accès rapide.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{favorite.name}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{favorite.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Favori de {user?.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileFavorites;
