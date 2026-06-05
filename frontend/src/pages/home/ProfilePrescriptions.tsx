import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfilePrescriptions = () => {
  const { user } = useAuthContext();
  const prescriptions = [
    { id: 'ORD-101', name: 'Amoxicilline 500mg', status: 'Prête', date: '14 mai 2026' },
    { id: 'ORD-102', name: 'Paracétamol 650mg', status: 'En attente', date: '12 mai 2026' },
    { id: 'ORD-103', name: 'Vitamine C', status: 'Reçue', date: '05 mai 2026' },
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
            <h1 className="text-3xl font-bold">Mes ordonnances numériques</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Retrouvez toutes vos ordonnances et leur statut de traitement.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{prescription.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{prescription.date}</p>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-sky-600">
                  {prescription.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Ordonnance liée à {user?.username} • N° {prescription.id}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePrescriptions;
