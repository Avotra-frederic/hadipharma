import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LiaSearchSolid, LiaArrowLeftSolid } from 'react-icons/lia';
import { usePharmacies } from '../../features/pharmacy/hooks/usePharmacies';

type PharmacySearchResult = {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  category?: string;
  description?: string;
};

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(queryParam);
  const { data: pharmacies } = usePharmacies();

  const updateQuery = (value: string) => {
    setLocalQuery(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(localQuery);
  };

  const q = queryParam.trim().toLowerCase();
  const results = (pharmacies || []).filter((p: { name?: string; address?: string; phone?: string; email?: string; category?: string; description?: string }) => {
    if (!q) return false;
    const text = [
      p.name,
      p.address,
      p.phone,
      p.email,
      p.category,
      p.description,
    ]
      .filter((value) => typeof value === 'string' && value.trim().length > 0)
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });

  const totalResults = results.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-16 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4">
            <LiaArrowLeftSolid size={16} />
            Retour à l'accueil
          </Link>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm px-4 py-2">
              <LiaSearchSolid size={20} className="text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Rechercher une pharmacie, un médicament..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button type="submit" className="hidden">Rechercher</button>
            </div>
          </form>

          {queryParam && (
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <LiaSearchSolid size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Résultats pour "<span className="text-emerald-600">{queryParam}</span>"
              </h1>
            </div>
          )}
          <p className="text-gray-500 dark:text-gray-400">
            {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-16 py-8">
        {!queryParam || totalResults === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {queryParam ? 'Aucun résultat' : 'Commencez votre recherche'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {queryParam
                ? 'Nous n\'avons trouvé aucune pharmacie ni médicament correspondant. Essayez avec d\'autres mots-clés.'
                : 'Entrez un mot-clé dans la barre de recherche pour trouver une pharmacie ou un médicament.'}
            </p>
            {queryParam && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-6 bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors"
              >
                <LiaArrowLeftSolid size={18} />
                Retour à l'accueil
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((pharmacy: PharmacySearchResult) => (
              <Link
                key={pharmacy._id}
                to={`/pharmacy/${pharmacy._id}`}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">{pharmacy.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="truncate">{pharmacy.address}</span>
                    </div>
                    {pharmacy.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{pharmacy.phone}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          pharmacy.isOpen
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}
                      >
                        {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                      {pharmacy.is24 && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          24h/24
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchPage;
