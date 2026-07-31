import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { LiaSearchSolid, LiaArrowLeftSolid } from 'react-icons/lia';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(queryParam);
  const [results, setResults] = useState<{ pharmacies: any[]; medications: any[] }>({ pharmacies: [], medications: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = localQuery.trim();
    if (!term) {
      setResults({ pharmacies: [], medications: [] });
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/search?q=${encodeURIComponent(term)}`);
        const data = await response.json();
        setResults({ pharmacies: data.pharmacies || [], medications: data.medications || [] });
      } catch {
        setResults({ pharmacies: [], medications: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [localQuery]);

  const updateQuery = (value: string) => {
    setLocalQuery(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(localQuery);
  };

  const totalResults = results.pharmacies.length + results.medications.length;
  const showSuggestions = localQuery.trim().length > 0 && localQuery.trim() !== queryParam.trim();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-16 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4">
            <LiaArrowLeftSolid size={16} />
            Retour à l'accueil
          </Link>

          <form onSubmit={handleSubmit} className="mb-6 relative">
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
            {(showSuggestions || loading) && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                {loading ? <p className="px-4 py-3 text-sm text-gray-500">Recherche...</p> : (
                  <>
                    {results.pharmacies.slice(0, 4).map((pharmacy) => (
                      <button type="button" key={`p-${pharmacy._id}`} onClick={() => { setLocalQuery(pharmacy.name); updateQuery(pharmacy.name); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <span>🏥</span><span className="truncate text-gray-800 dark:text-gray-100">{pharmacy.name}</span><span className="ml-auto text-xs text-gray-400">Pharmacie</span>
                      </button>
                    ))}
                    {results.medications.slice(0, 5).map((medication) => (
                      <button type="button" key={`m-${medication._id}-${medication.pharmacyId}`} onClick={() => { setLocalQuery(medication.name); updateQuery(medication.name); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <span>💊</span><span className="truncate text-gray-800 dark:text-gray-100">{medication.name}</span><span className="ml-auto text-xs text-gray-400 truncate max-w-[40%]">{medication.pharmacyName}</span>
                      </button>
                    ))}
                    {!results.pharmacies.length && !results.medications.length && <p className="px-4 py-3 text-sm text-gray-500">Aucune suggestion</p>}
                  </>
                )}
              </div>
            )}
          </form>

          {queryParam && (
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <LiaSearchSolid size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold break-words text-gray-900 dark:text-white">
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
            {results.pharmacies.map((pharmacy) => (
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
            {results.medications.map((medication) => (
              <Link key={`med-${medication._id}-${medication.pharmacyId}`} to={`/pharmacy/${medication.pharmacyId}`} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-start gap-4"><div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl shrink-0">💊</div><div className="min-w-0"><h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">{medication.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{medication.pharmacyName}</p>{medication.category && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{medication.category}</p>}</div></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchPage;
