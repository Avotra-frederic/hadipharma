import React from 'react';
import { Link } from 'react-router-dom';
import { LiaChevronRightSolid, LiaCogSolid, LiaHeartSolid, LiaReceiptSolid, LiaShoppingCartSolid, LiaUserSolid } from 'react-icons/lia';
import { useAuthContext } from '../features/auth';
import { useCart } from '../features/cart';

const sections = [
  { title: 'Mon profil', to: '/profil', icon: <LiaUserSolid size={20} /> },
  { title: 'Mes commandes', to: '/profil/commandes', icon: <LiaReceiptSolid size={20} /> },
  { title: 'Favoris', to: '/profil/favoris', icon: <LiaHeartSolid size={20} /> },
  { title: 'Paramètres', to: '/profil/parametres', icon: <LiaCogSolid size={20} /> },
];

export const MobileProfile: React.FC = () => {
  const { user } = useAuthContext();
  const { getTotalItems } = useCart();

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] bg-linear-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <LiaUserSolid size={28} />
          </div>
          <div>
            <p className="text-sm text-emerald-100">{user ? 'Compte connecté' : 'Compte client'}</p>
            <h2 className="text-lg font-semibold">{user ? user.username : 'Bienvenue chez HadiPharma'}</h2>
            {user?.email && <p className="text-sm text-emerald-100">{user.email}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/cart" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <LiaShoppingCartSolid size={20} />
            </div>
            <div>
              <p className="font-semibold">Panier</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{getTotalItems()} article{getTotalItems() > 1 ? 's' : ''}</p>
            </div>
          </div>
        </Link>
        <Link to="/profil/commandes" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <LiaReceiptSolid size={20} />
            </div>
            <div>
              <p className="font-semibold">Commandes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Historique et suivi</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {sections.map((item) => (
          <Link key={item.to} to={item.to} className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {item.icon}
              </div>
              <span className="font-medium">{item.title}</span>
            </div>
            <LiaChevronRightSolid size={18} className="text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  );
};
