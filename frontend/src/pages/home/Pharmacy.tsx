import React, { useState } from 'react'
import { LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia'
import { useParams, useNavigate } from 'react-router-dom'
import { usePharmacy } from '../../features/pharmacy/hooks/usePharmacy'
import { useMedications } from '../../features/admin/hooks/useAdmin'
import { useCart } from '../../features/cart'
import { useTheme } from '../../features/theme'
import { useAuthContext } from '../../features/auth'
import { getUploadImageUrl } from '../../utils/image'
import ProductCardWithButton from '../../components/ui/Card/ProductCardWithButton'
import { useToast } from '../../features/ui/toast'
import type { IMedication } from '../../features/admin/types'
import RatePharmacy from '../../features/pharmacy/components/RatePharmacy'

function Pharmacy() {
  const { id } = useParams();
  const { data: pharmacy, isLoading: pharmacyLoading, refetch: refetchPharmacy } = usePharmacy(id as string);
  const { data: medications, isLoading: medsLoading } = useMedications(id as string);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedMedication, setSelectedMedication] = useState<IMedication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredMedications = selectedCategory === 'all'
    ? medications
    : selectedCategory === 'prescription'
      ? medications.filter(med => med.requiresPrescription)
      : medications.filter(med => !med.requiresPrescription);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'prescription', label: 'Sur ordonnance' },
    { id: 'no-prescription', label: 'Sans ordonnance' }
  ];

  const handleAddToCart = (medication: IMedication) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const quantity = quantities[medication._id] || 1;
    if (quantity < 1) return;

    addToCart({
      medicationId: medication._id,
      medicationName: medication.name,
      price: medication.price,
      quantity,
      pharmacyId: id as string,
      pharmacyName: pharmacy?.name || '',
      requiresPrescription: medication.requiresPrescription,
      photo: medication.photo
    });

    showToast(`${medication.name} ajouté au panier`, 'success');
    setQuantities(prev => ({ ...prev, [medication._id]: 1 }));
  };

  const openMedicationDetails = (medication: IMedication) => {
    setSelectedMedication(medication);
    setQuantities(prev => ({ ...prev, [medication._id]: prev[medication._id] || 1 }));
    setIsDetailOpen(true);
  };

  const closeMedicationDetails = () => {
    setIsDetailOpen(false);
    setSelectedMedication(null);
  };

  const handleModalAddToCart = () => {
    if (selectedMedication) {
      handleAddToCart(selectedMedication);
      closeMedicationDetails();
    }
  };

  const handleQuantityChange = (medicationId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantities(prev => ({ ...prev, [medicationId]: 1 }));
    } else {
      setQuantities(prev => ({ ...prev, [medicationId]: newQuantity }));
    }
  };

  return (
    <React.Fragment>
      {/* Hero Section */}
      <section className={`pt-16 md:pt-24 lg:pt-28 pb-4 sm:pb-6 md:pb-8 lg:pb-10 min-h-[60vh] sm:min-h-[70vh] md:min-h-[75vh] lg:min-h-[80vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#053229]'} bg-[url("/images/bg4.jpg")] bg-cover bg-center bg-blend-soft-light rounded-bl-2xl sm:rounded-bl-3xl md:rounded-bl-[3rem] lg:rounded-bl-[6rem] rounded-br-2xl sm:rounded-br-3xl md:rounded-br-[3rem] lg:rounded-br-[6rem] relative`}>
        <div className="container mx-auto h-full">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-end">
            <div className={`flex flex-col justify-end ${theme === 'dark' ? 'text-gray-100' : 'text-white'} px-2 sm:px-4 md:px-0`}>
              <span className="inline-block mb-2 sm:mb-3 md:mb-4 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-emerald-400 text-xs sm:text-sm md:text-base font-bold text-gray-900 w-fit">
                {!pharmacyLoading && pharmacy?.isOpen ? 'Ouvert maintenant' : 'Fermé'}
              </span>
              <h1 className='text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 sm:mb-3 md:mb-4 capitalize'>
                {!pharmacyLoading && pharmacy?.name}
              </h1>
              <p className='max-w-2xl text-xs sm:text-sm md:text-base opacity-90 mb-4 sm:mb-4 md:mb-6'>
                {!pharmacyLoading && pharmacy?.address}
              </p>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl'>
                <div className='p-3 sm:p-4 rounded-2xl sm:rounded-2xl md:rounded-3xl bg-white/10 border border-white/10'>
                  <p className='text-xs uppercase tracking-[0.2em] opacity-80 mb-1 sm:mb-2'>Horaires</p>
                  <p className='text-xs sm:text-sm md:text-base font-semibold'>
                    {!pharmacyLoading && pharmacy?.openHours ? pharmacy.openHours : 'Horaires non renseignés'}
                  </p>
                  <p className='text-xs mt-1 opacity-80'>
                    {!pharmacyLoading && pharmacy?.is24 ? 'Ouvert 24h/24' : 'Horaires standards'}
                  </p>
                </div>
                <div className='p-3 sm:p-4 rounded-2xl sm:rounded-2xl md:rounded-3xl bg-white/10 border border-white/10'>
                  <p className='text-xs uppercase tracking-[0.2em] opacity-80 mb-1 sm:mb-2'>Contact</p>
                  <p className='text-xs sm:text-sm md:text-base font-semibold'>{!pharmacyLoading && pharmacy?.phone ? pharmacy.phone : 'N/A'}</p>
                  {pharmacy?.whatsapp && (
                    <p className='text-xs sm:text-sm md:text-base font-semibold'>WhatsApp: {pharmacy.whatsapp}</p>
                  )}
                  {pharmacy?.email && (
                    <p className='text-xs sm:text-sm md:text-base font-semibold'>Email: {pharmacy.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className='rounded-2xl sm:rounded-3xl md:rounded-4xl bg-white/90 dark:bg-slate-900/90 border border-white/10 shadow-2xl shadow-black/20 overflow-hidden'>
              <div className='relative h-48 sm:h-56 md:h-64 lg:h-full'>
                {pharmacy?.photo ? (
                  <img
                    src={getUploadImageUrl(pharmacy.photo)}
                    alt={pharmacy.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl text-gray-400'>
                    💊
                  </div>
                )}
              </div>
              <div className='p-3 sm:p-4 md:p-6 lg:p-8'>
                <div className='flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4'>
                  <div>
                    <h2 className='text-base sm:text-lg md:text-xl font-bold'>{!pharmacyLoading && pharmacy?.name}</h2>
                    <p className='text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1'>{!pharmacyLoading && pharmacy?.address}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>Avis</p>
                    <p className='text-base sm:text-lg md:text-xl font-semibold'>{!pharmacyLoading && pharmacy?.rating !== undefined ? pharmacy.rating.toFixed(1) : '—'}</p>
                  </div>
                </div>
                <div className='space-y-2 sm:space-y-2 md:space-y-3 text-xs sm:text-xs md:text-sm text-gray-700 dark:text-gray-200'>
                  <p><span className='font-semibold'>Téléphone:</span> {!pharmacyLoading && pharmacy?.phone ? pharmacy.phone : 'Non disponible'}</p>
                  {pharmacy?.whatsapp && (
                    <p><span className='font-semibold'>WhatsApp:</span> {pharmacy.whatsapp}</p>
                  )}
                  {pharmacy?.email && (
                    <p><span className='font-semibold'>Email:</span> {pharmacy.email}</p>
                  )}
                  <p><span className='font-semibold'>Adresse:</span> {!pharmacyLoading && pharmacy?.address}</p>
                  <p><span className='font-semibold'>Ouverture:</span> {!pharmacyLoading && pharmacy?.openHours ? pharmacy.openHours : 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medications Section */}
      <section className='px-2 sm:px-4 md:px-8 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-16'>
        <div className="mb-6 sm:mb-6 md:mb-8">
          <h2 className={`text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-4 md:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Médicaments disponibles
          </h2>

          {/* Filter Navigation */}
          <nav className='flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full text-xs font-semibold transition-all ${selectedCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Medications Grid */}
        {medsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} h-40 sm:h-48 md:h-56 rounded-lg sm:rounded-lg md:rounded-xl animate-pulse`}></div>
            ))}
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
              Aucun médicament trouvé dans cette catégorie
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {filteredMedications.map(medication => (
              <ProductCardWithButton
                key={medication._id}
                title={medication.name}
                description={medication.description || 'Description non disponible.'}
                imageUrl={medication.photo ? getUploadImageUrl(medication.photo) : '/images/bg2.jpg'}
                price={medication.price}
                tag={medication.requiresPrescription ? 'Sur ordonnance' : medication.category}
                onView={() => openMedicationDetails(medication)}
              />
            ))}
          </div>
        )}

        {/* Rating Section */}
        {id && !pharmacyLoading && pharmacy && (
          <div className="mt-12 mb-12">
            {user ? (
              <RatePharmacy pharmacyId={id} onRatingSubmitted={() => refetchPharmacy()} />
            ) : (
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md text-center">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Connectez-vous pour évaluer cette pharmacie
                </p>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="mt-3 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-semibold"
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {isDetailOpen && selectedMedication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-6">
          <div className="absolute inset-0" onClick={closeMedicationDetails} />
          <div className="relative my-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 sm:max-h-[calc(100vh-3rem)]">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Détails médicament</p>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{selectedMedication.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeMedicationDetails}
                className="text-slate-500 dark:text-slate-300 rounded-full p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-48 sm:h-64 lg:h-80">
                {selectedMedication.photo ? (
                  <img src={getUploadImageUrl(selectedMedication.photo)} alt={selectedMedication.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl sm:text-7xl text-slate-400">💊</div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs sm:text-sm font-semibold dark:bg-emerald-900/30 dark:text-emerald-300">
                    {selectedMedication.price.toFixed(2)} €
                  </span>
                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs sm:text-sm font-semibold dark:bg-slate-800 dark:text-slate-300">
                    {selectedMedication.requiresPrescription ? 'Sur ordonnance' : selectedMedication.category}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">Description</h3>
                  <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-300 whitespace-pre-line max-h-36 sm:max-h-48 overflow-y-auto">
                    {selectedMedication.description || 'Aucune description disponible pour ce médicament.'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">Quantité</h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedMedication._id, (quantities[selectedMedication._id] || 1) - 1)}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    <LiaMinusSolid size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantities[selectedMedication._id] || 1}
                    onChange={(e) => handleQuantityChange(selectedMedication._id, parseInt(e.target.value) || 1)}
                    className="w-full text-center rounded-lg sm:rounded-xl border border-slate-300 bg-white py-2.5 sm:py-3 text-base sm:text-lg font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedMedication._id, (quantities[selectedMedication._id] || 1) + 1)}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    <LiaPlusSolid size={16} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalAddToCart}
                className="w-full rounded-xl sm:rounded-2xl bg-emerald-600 py-3 sm:py-4 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors text-sm sm:text-base"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Badge FAB */}
    </React.Fragment>
  )
}

export default Pharmacy
