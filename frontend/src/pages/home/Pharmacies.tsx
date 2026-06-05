import { useState, useMemo, useEffect } from 'react';
import { FiChevronLeft, FiSearch, FiMapPin, FiClock, FiActivity, FiArrowRight } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { usePharmacies } from '../../features/pharmacy/hooks/usePharmacies';

const Pharmacies = () => {
    const { data, isLoading } = usePharmacies();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [activeFilter, setActiveFilter] = useState<'all' | 'open' | '24h'>(() => {
      const filter = searchParams.get('filter')
      return filter === 'open' || filter === '24h' ? filter : 'all'
    });

    const filteredPharmacies = useMemo(() => {
        return data?.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.address.toLowerCase().includes(searchQuery.toLowerCase());
            if (activeFilter === 'open') return matchesSearch && p.isOpen;
            if (activeFilter === '24h') return matchesSearch && p.is24;
            return matchesSearch;
        });
    }, [data, searchQuery, activeFilter]);

    useEffect(() => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (activeFilter !== 'all') params.set('filter', activeFilter);
      setSearchParams(params, { replace: true });
    }, [searchQuery, activeFilter, setSearchParams]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
            {/* --- Sous-Header (Page Header) --- */}
            <div className="bg-white dark:bg-slate-900 px-6 py-6 md:py-10 border-b border-slate-50 dark:border-slate-700">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
                    <FiChevronLeft size={22} />
                  </Link>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Nos Pharmacies</h1>
                  <div className="w-12"></div> {/* Equilibre visuel */}
                </div>

                {/* Recherche & Filtres */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Nom, quartier, ville..." 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-4 pl-14 pr-6 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {[
                      { id: 'all', label: 'Toutes', icon: <FiActivity size={14}/> },
                      { id: 'open', label: 'Ouvertes', icon: <FiClock size={14}/> },
                      { id: '24h', label: '24h/24', icon: <span className="text-[10px] font-bold">24</span> }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setActiveFilter(btn.id as never)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                          activeFilter === btn.id 
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-400' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Liste des Pharmacies --- */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-white dark:bg-slate-800 animate-pulse rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm" />
                        ))
                    ) : (
                        filteredPharmacies?.map((pharmacy) => (
                            <Link 
                                key={pharmacy._id} 
                                to={`/pharmacy/${pharmacy._id}`}
                                className="group bg-white dark:bg-slate-900 p-5 rounded-4xl border border-slate-50 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 hover:border-blue-100 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row gap-5 items-center sm:items-start"
                            >
                                <div className="relative shrink-0">
                                    <img 
                                        src={`${import.meta.env.VITE_API_BASE_URL}/${pharmacy.photo}` || '/images/bg1.jpg'} 
                                        alt={pharmacy.name} 
                                        className="w-28 h-28 rounded-3xl object-cover shadow-inner group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${pharmacy.isOpen ? 'bg-emerald-500' : 'bg-rose-500'} shadow-sm`} />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col h-full text-center sm:text-left">
                                    <div className="mb-2">
                                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-xl leading-tight group-hover:text-blue-600 transition-colors">
                                          {pharmacy.name}
                                      </h3>
                                      <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-slate-400">
                                          <FiMapPin size={14} className="shrink-0" />
                                          <p className="text-xs font-medium italic truncate">
                                              {pharmacy.address}
                                          </p>
                                      </div>
                                    </div>

                                    <div className="mt-auto flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                                        pharmacy.isOpen 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : 'bg-rose-50 text-rose-600'
                                      }`}>
                                          {pharmacy.isOpen ? 'Ouvert actuellement' : 'Fermé'}
                                      </span>
                                      {pharmacy.is24 && (
                                          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase">Service 24h/24</span>
                                      )}
                                      <div className="ml-auto hidden sm:flex items-center gap-1 text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                        Voir <FiArrowRight />
                                      </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                
                {!isLoading && filteredPharmacies?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Aucune pharmacie ne correspond à votre recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pharmacies;