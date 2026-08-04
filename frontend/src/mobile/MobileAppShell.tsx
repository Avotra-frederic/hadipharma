import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LiaHomeSolid, LiaStoreSolid, LiaShoppingBagSolid, LiaUserSolid } from 'react-icons/lia';

const tabs = [
  { to: '/', label: 'Accueil', icon: <LiaHomeSolid size={20} /> },
  { to: '/pharmacies', label: 'Pharmacies', icon: <LiaStoreSolid size={20} /> },
  { to: '/cart', label: 'Panier', icon: <LiaShoppingBagSolid size={20} /> },
  { to: '/profil', label: 'Profil', icon: <LiaUserSolid size={20} /> },
];

export const MobileAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-24 pt-3 sm:px-4 lg:px-6">
        <header className="mb-4 rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">HadiPharma</p>
              <h1 className="text-lg font-semibold">Expérience client</h1>
            </div>
            <Link to="/auth/login" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
              Se connecter
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <nav className="fixed bottom-3 left-1/2 z-20 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 rounded-[24px] border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 sm:w-[calc(100%-2rem)]">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
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
