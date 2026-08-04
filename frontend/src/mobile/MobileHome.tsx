import React from 'react';
import { Link } from 'react-router-dom';
import { LiaArrowRightSolid, LiaBoxSolid, LiaTruckSolid, LiaShieldAltSolid } from 'react-icons/lia';

const features = [
  { title: 'Recherche rapide', text: 'Trouvez vos médicaments en quelques secondes.', icon: <LiaBoxSolid size={22} /> },
  { title: 'Suivi des commandes', text: 'Recevez le statut de chaque commande en temps réel.', icon: <LiaTruckSolid size={22} /> },
  { title: 'Paiement sécurisé', text: 'Protégez vos achats avec des modes de paiement fiables.', icon: <LiaShieldAltSolid size={22} /> },
];

export const MobileHome: React.FC = () => {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-100">Bienvenue</p>
        <h2 className="mt-2 text-2xl font-semibold">Commandez vos médicaments en toute simplicité</h2>
        <p className="mt-2 text-sm text-emerald-50">Une expérience mobile pensée pour les clients comme pour les pharmacies.</p>
        <Link to="/pharmacies" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
          Découvrir les pharmacies <LiaArrowRightSolid size={18} />
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
