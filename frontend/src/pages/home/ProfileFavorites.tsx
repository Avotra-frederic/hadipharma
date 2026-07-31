import { useEffect, useState } from 'react';
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfileFavorites = () => {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = import.meta.env.VITE_API_BASE_URL;
  const load = async () => {
    if (!user?._id) return;
    const response = await fetch(`${api}/auth/${user._id}/favorites`, { credentials: 'include' });
    const data = await response.json(); setFavorites(data.favorites || []); setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, [user?._id]);
  const remove = async (id: string) => { await fetch(`${api}/auth/${user?._id}/favorites/${id}`, { method: 'POST', credentials: 'include' }); load(); };
  return <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100"><div className="container mx-auto px-4 py-8">
    <div className="flex items-center gap-4 mb-8"><Link to="/profil" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"><FiChevronLeft size={20} /></Link><div><h1 className="text-3xl font-bold">Médicaments favoris</h1><p className="text-sm text-slate-500 mt-1">Vos médicaments enregistrés.</p></div></div>
    {loading ? <p className="text-slate-500">Chargement...</p> : favorites.length === 0 ? <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center text-slate-500">Aucun médicament favori.</div> : <div className="grid gap-4">{favorites.map((favorite) => <div key={favorite._id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">{favorite.name}</h2><p className="mt-2 text-sm text-slate-500">{favorite.description || favorite.category}</p>{favorite.pharmacy?.name && <p className="mt-1 text-xs text-emerald-600">{favorite.pharmacy.name}</p>}</div><button onClick={() => remove(favorite._id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl" aria-label="Retirer"><FiTrash2 /></button></div>)}</div>}
  </div></div>;
};
export default ProfileFavorites;
