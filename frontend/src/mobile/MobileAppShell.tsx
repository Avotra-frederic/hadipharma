import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LiaHomeSolid, LiaStoreSolid, LiaShoppingBagSolid, LiaUserSolid, LiaShoppingCartSolid, LiaPillsSolid } from 'react-icons/lia';
import { useAuthContext } from '../features/auth';
import { useCart } from '../features/cart';

const tabs = [
  { to: '/mobile/home', label: 'Accueil', icon: <LiaHomeSolid size={20} /> },
  { to: '/pharmacies', label: 'Pharmacies', icon: <LiaStoreSolid size={20} /> },
  { to: '/mobile/orders', label: 'Commandes', icon: <LiaShoppingBagSolid size={20} /> },
  { to: '/mobile/profile', label: 'Profil', icon: <LiaUserSolid size={20} /> },
];

export const MobileAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const showPharmacyTab = user?.role === 'admin' || user?.role === 'pharmacist';
  const navigationTabs = showPharmacyTab
    ? [
        ...tabs.slice(0, 2),
        { to: '/mobile/pharmacy', label: 'Pharmacie', icon: <LiaPillsSolid size={20} /> },
        ...tabs.slice(2),
      ]
    : tabs;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eefbf5_100%)] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-24 pt-3 sm:px-4 lg:px-6">
        <header className="mb-4 rounded-[28px] border border-emerald-100 bg-white/90 p-4 shadow-[0_10px_30px_rgba(16,185,129,0.12)] backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="HadiPharma logo" className="h-11 w-11 rounded-full object-cover shadow-sm" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">HadiPharma</p>
                <h1 className="text-lg font-semibold">Expérience client</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/cart" className="relative rounded-full bg-slate-100 p-2.5 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-700 dark:text-slate-100">
                <LiaShoppingCartSolid size={18} />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to={isAuthenticated ? '/mobile/profile' : '/auth/login'} className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                {isAuthenticated ? (user?.username || 'Compte') : 'Se connecter'}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <nav className="fixed bottom-3 left-1/2 z-20 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)] backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 sm:w-[calc(100%-2rem)]">
          <div className={`grid gap-2 ${showPharmacyTab ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {navigationTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`
                }
              >
                {tab.icon}
                <span className="mt-1">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
