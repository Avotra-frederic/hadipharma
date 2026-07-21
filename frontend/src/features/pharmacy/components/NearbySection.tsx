import React, { useMemo, useState } from 'react'
import CardWithImage from '../../../components/ui/Card/CardWithImage'
import { useNearby } from '../hooks/useNearby';
import { getUploadImageUrl } from '../../../utils/image';
import { Link } from 'react-router-dom';

const RADIUS_OPTIONS = [100, 500, 1000, 2000];

function NearbySection() {
    const [radius, setRadius] = useState<number>(500);
    const [showAll, setShowAll] = useState<boolean>(false);
    const { data, isLoading, error } = useNearby(radius);

    const nearbyPharmacies = useMemo(() => {
        if (!data) return [];
        return showAll ? data : data.slice(0, 4);
    }, [data, showAll]);

    return (
        <React.Fragment>
            <section className='px-4 md:px-16 pb-10'>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className=''>
                        <h1 className='text-xl font-bold'>Pharmacies à proximité</h1>

                    </div>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Filtrer par distance :</span>
                        {RADIUS_OPTIONS.map(option => (
                            <button
                                key={option}
                                type='button'
                                onClick={() => setRadius(option)}
                                className={`px-4 py-1 rounded-full text-sm font-medium transition ${radius === option ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {option}
                            </button>
                        ))}
                        <div className='md:ml-auto'>
                            {!isLoading && !error && data.length > 4 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className='px-4 py-2 rounded-full text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition'
                                >
                                    {showAll ? 'Afficher moins' : 'Voir plus'}
                                </button>
                            )}
                        </div>
                    </div>
                    <Link to={"/pharmacies"} className='text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors'>
                        Voir plus
                    </Link>
                </div>

                <div className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                    {isLoading && 'Chargement des pharmacies proches...'}
                    {error && `Erreur : ${error}`}
                    {!isLoading && !error && data.length === 0 && 'Aucune pharmacie proche trouvée.'}
                    {!isLoading && !error && data.length > 0 && `Affichage de ${nearbyPharmacies.length} sur ${data.length} pharmacies dans un rayon de ${radius} mètres.`}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {nearbyPharmacies.map((pharmacy) => (
                        <CardWithImage
                            key={pharmacy._id}
                            title={pharmacy.name}
                            openHours={pharmacy.openHours}
                            imageUrl={pharmacy.photo ? getUploadImageUrl(pharmacy.photo) : '/images/bg2.jpg'}
                            visitLink={`/pharmacy/${pharmacy._id}`}
                        />
                    ))}
                </div>
            </section>
        </React.Fragment>
    )
}

export default NearbySection