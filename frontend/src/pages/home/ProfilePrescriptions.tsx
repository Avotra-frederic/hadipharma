import { useState, useEffect } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

import type { OrderItem } from '../../features/pharmacy/types';

type PrescriptionStatus = 'pending' | 'approved' | 'rejected';

type PrescriptionItem = {
  id: string;
  fileName?: string;
  status: PrescriptionStatus;
  date: string;
  orderId: string;
};

const statusColor: Record<PrescriptionStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const statusLabel: Record<PrescriptionStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

const ProfilePrescriptions = () => {
  const { user } = useAuthContext();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/auth/${user._id}/orders`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = (await res.json()) as OrderItem[];
        const filtered = data
          .filter((o) => o.prescription && o.prescription.fileName)
          .map((o) => ({
            id: o.orderReference || o._id,
            fileName: o.prescription!.fileName,
            status: (o.prescription!.status || 'pending') as PrescriptionStatus,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '-',
            orderId: o._id,
          }));
        setPrescriptions(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

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
            <h1 className="text-3xl font-bold">Mes ordonnances</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Retrouvez toutes vos ordonnances et leur statut de traitement.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-12">Chargement...</p>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Aucune ordonnance
            </h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              Vous n'avez pas encore d'ordonnance enregistrée.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{prescription.fileName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {prescription.date} • N° {prescription.id}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[prescription.status]}`}>
                    {statusLabel[prescription.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePrescriptions;
