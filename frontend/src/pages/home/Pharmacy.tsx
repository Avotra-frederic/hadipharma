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

function Pharmacy() {
  const { id } = useParams();
  const { data: pharmacy, isLoading: pharmacyLoading } = usePharmacy(id as string);
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
      <section className={`min-h-[60vh] md:min-h-[80vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#053229]'} bg-[url("/images/bg4.jpg")] bg-cover bg-center bg-blend-soft-light rounded-bl-[3rem] md:rounded-bl-[6rem] rounded-br-[3rem] md:rounded-br-[6rem] relative`}>
        <div className="container mx-auto h-full">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-end py-8 md:py-12">
            <div className={`flex flex-col justify-end ${theme === 'dark' ? 'text-gray-100' : 'text-white'} px-4 md:px-0`}>
              <span className="inline-block mb-4 px-5 py-2 rounded-full bg-emerald-400 text-sm md:text-base font-bold text-gray-900 w-fit">
                {!pharmacyLoading && pharmacy?.isOpen ? 'Ouvert maintenant' : 'Fermé'}
              </span>
              <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 capitalize'>
                {!pharmacyLoading && pharmacy?.name}
              </h1>
              <p className='max-w-2xl text-sm md:text-base opacity-90 mb-6'>
                {!pharmacyLoading && pharmacy?.address}
              </p>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl'>
                <div className='p-4 rounded-3xl bg-white/10 border border-white/10'>
                  <p className='text-xs uppercase tracking-[0.2em] opacity-80 mb-2'>Horaires</p>
                  <p className='text-sm md:text-base font-semibold'>
                    {!pharmacyLoading && pharmacy?.openHours ? pharmacy.openHours : 'Horaires non renseignés'}
                  </p>
                  <p className='text-xs mt-2 opacity-80'>
                    {!pharmacyLoading && pharmacy?.is24 ? 'Ouvert 24h/24' : 'Horaires standards'}
                  </p>
                </div>
                <div className='p-4 rounded-3xl bg-white/10 border border-white/10'>
                  <p className='text-xs uppercase tracking-[0.2em] opacity-80 mb-2'>Contact</p>
                  <p className='text-sm md:text-base font-semibold'>{!pharmacyLoading && pharmacy?.phone ? pharmacy.phone : 'N/A'}</p>
                  {pharmacy?.whatsapp && (
                    <p className='text-sm md:text-base font-semibold'>WhatsApp: {pharmacy.whatsapp}</p>
                  )}
                  {pharmacy?.email && (
                    <p className='text-sm md:text-base font-semibold'>Email: {pharmacy.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className='rounded-4xl bg-white/90 dark:bg-slate-900/90 border border-white/10 shadow-2xl shadow-black/20 overflow-hidden'>
              <div className='relative h-64 md:h-full'>
                {pharmacy?.photo ? (
                  <img
                    src={getUploadImageUrl(pharmacy.photo)}
                    alt={pharmacy.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-6xl text-gray-400'>
                    💊
                  </div>
                )}
              </div>
              <div className='p-6 md:p-8'>
                <div className='flex items-center justify-between gap-3 mb-4'>
                  <div>
                    <h2 className='text-xl font-bold'>{!pharmacyLoading && pharmacy?.name}</h2>
                    <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>{!pharmacyLoading && pharmacy?.address}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Avis</p>
                    <p className='text-lg font-semibold'>{!pharmacyLoading && pharmacy?.rating ? pharmacy.rating.toFixed(1) : '—'}</p>
                  </div>
                </div>
                <div className='space-y-3 text-sm text-gray-700 dark:text-gray-200'>
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
      <section className='px-4 md:px-16 py-12 md:py-16'>
        <div className="mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Médicaments disponibles
          </h2>

          {/* Filter Navigation */}
          <nav className='flex flex-wrap items-center gap-2 md:gap-3'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all ${selectedCategory === category.id
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

        {/* Loading State */}
        {medsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} h-56 rounded-xl animate-pulse`}></div>
            ))}
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
              Aucun médicament trouvé dans cette catégorie
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedications.map(medication => (
              <ProductCardWithButton
                key={medication._id}
                title={medication.name}
                description={medication.description || 'Description non disponible.'}
                imageUrl={medication.photo ? getUploadImageUrl(medication.photo) : '/images/bg2.jpg'}
                price={medication.price}
                tag={medication.requiresPrescription ? 'Sur ordonnance' : medication.category}
                onClick={() => openMedicationDetails(medication)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {isDetailOpen && selectedMedication && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-6 sm:items-center sm:justify-center">
          <div className="absolute inset-0" onClick={closeMedicationDetails} />
          <div className="relative w-full max-w-xl rounded-t-3xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Détails médicament</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMedication.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeMedicationDetails}
                className="text-slate-500 dark:text-slate-300 rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-5">
              <div className="rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-56">
                {selectedMedication.photo ? (
                  <img src={getUploadImageUrl(selectedMedication.photo)} alt={selectedMedication.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-6xl text-slate-400">💊</div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-semibold dark:bg-emerald-900/30 dark:text-emerald-300">
                    {selectedMedication.price.toFixed(2)} €
                  </span>
                  <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-semibold dark:bg-slate-800 dark:text-slate-300">
                    {selectedMedication.requiresPrescription ? 'Sur ordonnance' : selectedMedication.category}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {selectedMedication.description || 'Aucune description disponible pour ce médicament.'}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quantité</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedMedication._id, (quantities[selectedMedication._id] || 1) - 1)}
                    className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <LiaMinusSolid size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantities[selectedMedication._id] || 1}
                    onChange={(e) => handleQuantityChange(selectedMedication._id, parseInt(e.target.value) || 1)}
                    className="w-full text-center rounded-xl border border-slate-300 bg-white py-3 text-lg dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(selectedMedication._id, (quantities[selectedMedication._id] || 1) + 1)}
                    className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <LiaPlusSolid size={18} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalAddToCart}
                className="w-full rounded-3xl bg-emerald-600 py-4 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
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