import React from 'react';
import { Link } from 'react-router-dom';
import { LiaArrowRightSolid, LiaBoxSolid, LiaTruckSolid, LiaShieldAltSolid, LiaShoppingCartSolid } from 'react-icons/lia';
import { usePharmacies } from '../features/pharmacy/hooks/usePharmacies';
import { useCart } from '../features/cart';
import { useAuthContext } from '../features/auth';
import { getUploadImageUrl } from '../utils/image';

const features = [
  { title: 'Recherche rapide', text: 'Trouvez vos médicaments en quelques secondes.', icon: <LiaBoxSolid size={22} /> },
  { title: 'Suivi des commandes', text: 'Recevez le statut de chaque commande en temps réel.', icon: <LiaTruckSolid size={22} /> },
  { title: 'Paiement sécurisé', text: 'Protégez vos achats avec des modes de paiement fiables.', icon: <LiaShieldAltSolid size={22} /> },
];

export const MobileHome: React.FC = () => {
  const { data: pharmacies = [], isLoading } = usePharmacies();
  const { getTotalItems } = useCart();
  const { user } = useAuthContext();
  const featuredPharmacies = pharmacies.slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-100">
          {user ? `Bienvenue ${user.username}` : 'Bienvenue'}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Commandez vos médicaments en toute simplicité</h2>
        <p className="mt-2 text-sm text-emerald-50">Une expérience mobile pensée pour les clients comme pour les pharmacies.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/pharmacies" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
            Découvrir les pharmacies <LiaArrowRightSolid size={18} />
          </Link>
          <Link to="/cart" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            <LiaShoppingCartSolid size={18} /> Panier ({getTotalItems()})
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Pharmacies disponibles</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Accédez rapidement aux pharmacies actives.</p>
          </div>
          <Link to="/pharmacies" className="text-sm font-semibold text-emerald-600">Voir tout</Link>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Chargement...</p>
        ) : featuredPharmacies.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune pharmacie disponible pour le moment.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {featuredPharmacies.map((pharmacy) => (
              <Link
                key={pharmacy._id || pharmacy.name}
                to={`/pharmacy/${pharmacy._id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <img
                  src={pharmacy.photo ? getUploadImageUrl(pharmacy.photo) : '/images/bg2.jpg'}
                  alt={pharmacy.name}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{pharmacy.name}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{pharmacy.address}</p>
                </div>
                <LiaArrowRightSolid className="text-slate-400" size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
