import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { Link } from 'react-router-dom';

const ProfileAddresses = () => {
  const { user } = useAuthContext(); const api = import.meta.env.VITE_API_BASE_URL;
  const [addresses, setAddresses] = useState<any[]>([]); const [form, setForm] = useState({ title: '', address: '', city: '', phone: '', isDefault: false });
  const load = async () => { if (!user?._id) return; const r = await fetch(`${api}/auth/${user._id}/addresses`, { credentials: 'include' }); const d = await r.json(); setAddresses(d.addresses || []); };
  useEffect(() => { load(); }, [user?._id]);
  const submit = async (e: FormEvent) => { e.preventDefault(); const r = await fetch(`${api}/auth/${user?._id}/addresses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) }); if (r.ok) { setForm({ title: '', address: '', city: '', phone: '', isDefault: false }); load(); } };
  const remove = async (id: string) => { await fetch(`${api}/auth/${user?._id}/addresses/${id}`, { method: 'DELETE', credentials: 'include' }); load(); };
  return <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100"><div className="container mx-auto px-4 py-8">
    <div className="flex items-center gap-4 mb-8"><Link to="/profil" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3"><FiChevronLeft size={20} /></Link><div><h1 className="text-3xl font-bold">Adresses de livraison</h1><p className="text-sm text-slate-500 mt-1">Ajoutez et gérez vos adresses.</p></div></div>
    <form onSubmit={submit} className="mb-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 grid sm:grid-cols-2 gap-3"><input required placeholder="Titre (Domicile)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl border p-3 bg-transparent" /><input required placeholder="Adresse complète" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="rounded-xl border p-3 bg-transparent" /><input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="rounded-xl border p-3 bg-transparent" /><input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl border p-3 bg-transparent" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} /> Adresse par défaut</label><button className="rounded-xl bg-emerald-600 text-white py-3 font-semibold">Ajouter l’adresse</button></form>
    <div className="grid gap-4">{addresses.map(a => <div key={a._id} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex justify-between gap-4"><div><div className="flex gap-2 items-center"><h2 className="text-lg font-semibold">{a.title}</h2>{a.isDefault && <span className="text-xs text-emerald-600">Par défaut</span>}</div><p className="mt-3 text-sm text-slate-500">{a.address}{a.city ? `, ${a.city}` : ''}</p>{a.phone && <p className="mt-1 text-xs text-slate-400">{a.phone}</p>}</div><button onClick={() => remove(a._id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl"><FiTrash2 /></button></div>)}</div>
  </div></div>;
}; export default ProfileAddresses;
