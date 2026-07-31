import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiMapPin} from 'react-icons/fi';
import { useGeocoding } from '../../features/pharmacy/hooks/useGeocoding';
import { createPharmacy } from '../../features/pharmacy/api/createPharmacy';
import { useAuthContext } from '../../features/auth';
import { useToast } from '../../features/ui/toast';


const RegisterPharmacy = () => {
  const navigate = useNavigate();
  const { getCoordinates, isGeocoding, geoError } = useGeocoding();
  const { refreshAuth } = useAuthContext();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    photo: null as File | null,
    openHours: '',
    is24: false,
    location: {
      type: 'Point' as const,
      coordinates: [0, 0] as [number, number]
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, photo: file }));
  };

  // Déclenché quand l'utilisateur quitte le champ adresse
  const handleAddressBlur = async () => {
    if (formData.address) {
      const coords = await getCoordinates(formData.address);
      if (coords) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, coordinates: coords }
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('whatsapp', formData.whatsapp || '');
      formDataToSend.append('openHours', formData.openHours || '');
       formDataToSend.append('is24', formData.is24 ? 'true' : 'false');
       formDataToSend.append('location', JSON.stringify(formData.location));
       
       if (formData.photo) {
         formDataToSend.append('photo', formData.photo);
       }

       const result = await createPharmacy(formDataToSend);
       await refreshAuth(); // Rafraîchir le token et le rôle (si rôle modifié côté serveur)
       if (result && result.message && result.message.includes('Pending')) {
         showToast("Pharmacie enregistrée et en attente de validation.", 'info');
         navigate('/pharmacies');
       } else {
         showToast('Pharmacie enregistrée !', 'success');
         navigate('/pharmacies');
       }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans antialiased bg-[#F8FAFC]">
      {/* --- En-tête avec fond --- */}
      <div className="flex-1 bg-[#053229] bg-[url('/images/bg1.jpg')] bg-blend-soft-light bg-cover relative overflow-hidden z-10 flex flex-col items-center justify-center min-h-[22rem] sm:min-h-[26rem]">
        <div className="absolute inset-0 z-0 opacity-20 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
        />
        
        <Link to="/" className="absolute left-4 top-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all z-30 sm:left-8 sm:top-8">
          <FiChevronLeft size={22} />
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 backdrop-blur-2xl rounded-full flex items-center justify-center mb-4 shadow-xl border border-white/20">
            <span className="text-2xl font-bold italic text-[#fcce02]">H</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">Ajouter votre Pharmacie</h1>
          <p className="text-white/70 text-sm mt-2 font-medium">Rejoignez le réseau de santé Hadipharma</p>
        </div>
      </div>

      {/* --- Formulaire --- */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 dark:text-white rounded-t-[50px] px-4 pt-10 pb-12 -mt-12 relative z-20 shadow-2xl mx-auto w-full flex-1 sm:-mt-20 sm:px-8 sm:pt-12 md:flex-none">
        <div className="max-w-md mx-auto space-y-8">
          {(error || geoError) && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold">
              {error || geoError}
            </div>
          )}

          {/* Nom de la pharmacie */}
          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Nom de l'établissement
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
              placeholder="ex: Pharmacie du Centre"
            />
          </div>

          {/* Adresse avec indicateur GPS */}
          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600 relative">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Adresse complète
            </label>
            <div className="flex items-center">
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                onBlur={handleAddressBlur}
                className="grow text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
                placeholder="Rue, Ville, Code Postal"
              />
              <FiMapPin className={formData.location.coordinates[0] !== 0 ? "text-emerald-500" : "text-gray-300"} />
            </div>
            {isGeocoding && <p className="absolute -bottom-5 text-[9px] text-sky-500 font-bold animate-pulse">Recherche des coordonnées...</p>}
            {formData.location.coordinates[0] !== 0 && !isGeocoding && <p className="absolute -bottom-5 text-[9px] text-emerald-500 font-bold">✓ Localisation GPS confirmée</p>}
          </div>

          {/* Téléphone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
                placeholder="034 00 000 00"
              />
            </div>
            <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
                placeholder="contact@pharmacie.com"
              />
            </div>
          </div>

          {/* WhatsApp & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
                placeholder="034 00 000 00"
              />
            </div>
            <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Photo (optionnel)
              </label>
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full text-sm font-bold text-slate-800  dark:text-white  outline-none bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          </div>

          {/* Horaires */}
          <div className="border-b-2 border-gray-100 py-1 transition focus-within:border-emerald-600">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Heures d'ouverture
            </label>
            <input
              type="text"
              name="openHours"
              value={formData.openHours}
              onChange={handleChange}
              className="w-full text-base font-bold text-slate-800  dark:text-white  outline-none bg-transparent placeholder:text-gray-300"
              placeholder="ex: Lun-Sam: 08h-20h"
            />
          </div>

          {/* 24h/24 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100">
            <span className="text-xs font-bold text-slate-600">Ouvert 24h/24 et 7j/7</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is24" checked={formData.is24} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || isGeocoding}
            className="w-full bg-[#053229] text-[#fcce02] py-5 rounded-4xl font-black uppercase tracking-widest text-xs hover:bg-[#0a4539] transition-all transform active:scale-95 shadow-xl shadow-emerald-900/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:transform-none mt-4"
          >
            {loading ? 'Traitement...' : 'Enregistrer la pharmacie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPharmacy;
