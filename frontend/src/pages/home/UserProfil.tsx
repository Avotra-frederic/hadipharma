import { FiChevronLeft, FiSettings, FiChevronRight, FiPackage, FiFileText, FiCreditCard, FiMapPin, FiHeart, FiLogOut, FiShield, FiCamera, FiRefreshCw } from 'react-icons/fi';
import { useAuthContext } from '../../features/auth';
import { useTheme } from '../../features/theme';
import { uploadUserPhoto } from '../../features/auth/api/auth';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/common/ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../features/ui/toast';

const UserProfil = () => {
    const { user, signOut, refreshAuth } = useAuthContext();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hasPharmacy, setHasPharmacy] = useState(false);
    const [pharmacyName, setPharmacyName] = useState('');
    const [pharmacyId, setPharmacyId] = useState('');
    const [requestingRenewal, setRequestingRenewal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [ordersCount, setOrdersCount] = useState<number | null>(null);
    const [prescriptionsCount, setPrescriptionsCount] = useState<number | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
      const checkPharmacy = async () => {
        if (!user?._id) return;
        setHasPharmacy(false);
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/pharmacy/user/${user._id}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            // API may return { message: 'Pharmacy created. Pending validation...', pharmacy }
            const pharmacy = result.pharmacy || result;
            if (pharmacy) {
              setPharmacyId(pharmacy._id || '');
              setHasPharmacy(true);
              setPharmacyName(pharmacy.name || '');
              // If pharmacy exists but not active or not validated, don't show admin link
              if (!pharmacy.isActive || !pharmacy.isValidated) {
                setHasPharmacy(false);
              }
            }
          }
        } catch (err) {
          console.error('Failed to check pharmacy:', err);
        }
      };
      checkPharmacy();
    }, [user?._id, user?.role]);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user) return;
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                const res = await fetch(`${API_BASE_URL}/auth/${user._id}/orders`, { credentials: 'include' });
                if (!res.ok) return;
                const data = await res.json();
                setOrdersCount(Array.isArray(data) ? data.length : 0);
                setPrescriptionsCount(Array.isArray(data) ? data.filter((o: { prescription?: { fileName?: string } }) => o.prescription && o.prescription.fileName).length : 0);
            } catch (err) {
                console.error('Failed to load profile counts:', err);
            }
        };
        fetchCounts();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        setShowLogoutConfirm(false);
        navigate('/auth/login');
    }

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?._id) return;
        
        setUploadingPhoto(true);
        try {
            await uploadUserPhoto(user._id, file);
            await refreshAuth();
        } catch (error) {
            console.error('Photo upload failed:', error);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    }

    const requestSubscriptionRenewal = async () => {
      if (!pharmacyId) return;
      setRequestingRenewal(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/pharmacies/${pharmacyId}/subscription`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Impossible d’envoyer la demande');
        showToast('Votre demande de renouvellement a été envoyée au super administrateur.', 'success');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Erreur lors de la demande', 'error');
      } finally {
        setRequestingRenewal(false);
      }
    };

  const menuItems = [
    { icon: <FiPackage className="text-blue-500" />, label: "Mes commandes", count: ordersCount !== null ? ordersCount : '', link: "/profil/commandes" },
    { icon: <FiFileText className="text-purple-500" />, label: "Mes ordonnances numériques", count: prescriptionsCount !== null ? prescriptionsCount : '', link: "/profil/ordonnances" },
    { icon: <FiHeart className="text-rose-500" />, label: "Médicaments favoris", link: "/profil/favoris" },
    { icon: <FiMapPin className="text-orange-500" />, label: "Adresses de livraison", link: "/profil/adresses" },
    { icon: <FiCreditCard className="text-emerald-500" />, label: "Modes de paiement", link: "/profil/paiements" },
    { icon: <FiSettings className="text-gray-500" />, label: "Paramètres", link: "/profil/parametres" },
    ...(hasPharmacy ? [{
      icon: <FiShield className="text-emerald-600 dark:text-emerald-400" />,
      label: "Administration",
      description: pharmacyName,
      link: "/admin",
      accent: true
    }] : []),
    ...(pharmacyId && (user?.role === 'admin' || user?.role === 'pharmacist') ? [{
      icon: <FiRefreshCw className="text-amber-600 dark:text-amber-400" />,
      label: requestingRenewal ? 'Envoi de la demande...' : 'Demander le renouvellement',
      description: 'Soumettre une demande au super administrateur',
      onClick: requestSubscriptionRenewal,
      accent: false,
    }] : []),
    ...(user?.role === 'superadmin' ? [{
      icon: <FiShield className="text-violet-600 dark:text-violet-400" />,
      label: "Super Admin",
      description: 'Gestion plateforme',
      link: "/superadmin",
      accent: false
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center p-0 md:p-6 font-sans">
      <div className="w-full bg-white dark:bg-slate-900 md:rounded-[40px] shadow-xl overflow-hidden flex flex-col relative min-h-screen">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-8">
          <Link to="/" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all">
            <FiChevronLeft size={22} />
          </Link>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Mon Profil</h1>
          <div className="flex items-center gap-2">
            {hasPharmacy && (
              <button
                onClick={() => navigate('/admin')}
                className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
                title="Accéder à l'administration"
              >
                <FiShield size={22} />
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* --- Section Identité Client --- */}
        <div className="flex flex-col items-center px-6 mb-8">
          <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={`${import.meta.env.VITE_API_BASE_URL}${user?.photo}` || `${import.meta.env.VITE_API_BASE_URL}${user?.photo}`|| `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}&background=10b981&color=fff`}
              alt={user?.username} 
              className="w-28 h-28 rounded-4xl border-4 border-white shadow-lg object-cover"
            />
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/50 rounded-4xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-white text-white shadow-md">
              <FiCamera size={14} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{user?.username}</h2>
          <p className="text-slate-400 dark:text-slate-400 text-sm font-medium">{user?.email}</p>
        </div>

        {/* --- Liste des Menus --- */}
        <div className="px-6 space-y-3 flex-1">
          {menuItems.map((item, i) => {
            const content = (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${
                    item.accent
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400'
                      : 'bg-white border-slate-50 text-current'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-200">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-slate-500 dark:text-gray-400">{item.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== '' && item.count !== undefined && (
                    <span className="bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 text-[10px] font-black px-2 py-0.5 rounded-lg">
                      {item.count}
                    </span>
                  )}
                  <FiChevronRight className="text-slate-300 group-hover:translate-x-1 transition-all dark:text-gray-600" />
                </div>
              </div>
            );

            if (item.link) {
              return (
                <Link key={i} to={item.link} className="block w-full">
                  <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-3xl border border-slate-50 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all group shadow-sm">
                    {content}
                  </button>
                </Link>
              );
            }

            return (
              <button key={i} onClick={item.onClick} disabled={requestingRenewal && Boolean(item.onClick)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-3xl border border-slate-50 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group shadow-sm disabled:opacity-60">
                {content}
              </button>
            );
          })}
        </div>

        {/* --- Bouton Déconnexion --- */}
        <div className="p-6">
          <button className="w-full flex items-center justify-center gap-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold py-5 rounded-3xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all" onClick={confirmLogout}>
            <FiLogOut size={20} />
            Déconnexion
          </button>
        </div>

        {/* --- Modal Confirmation Déconnexion --- */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto z-50 p-4 sm:p-6">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-sm w-full shadow-2xl`}>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full">
                  <FiLogOut className="text-rose-600 dark:text-rose-400" size={32} />
                </div>
              </div>
              <h2 className={`text-xl font-bold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Confirmer la déconnexion
              </h2>
              <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-3 rounded-xl font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfil;
