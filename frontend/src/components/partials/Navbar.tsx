import { LiaShoppingCartSolid, LiaUser } from "react-icons/lia"
import { FiMapPin } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuthContext } from "../../features/auth"
import { useCart } from "../../features/cart"
import { useToast } from "../../features/ui/toast/ToastContext"
import NotificationBell from "../notifications/NotificationBell"
import ThemeToggle from "../common/ThemeToggle"

function Navbar() {
    const { user, isAuthenticated, signOut } = useAuthContext()
    const { getTotalItems } = useCart()
    const { showToast } = useToast()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    const handleSignOut = async () => {
        try {
            await signOut()
            setShowUserMenu(false)
            showToast('Déconnexion réussie', 'success')
        } catch {
            showToast('Erreur lors de la déconnexion', 'error')
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-transparent">
            <div className="container mx-auto py-2 md:py-5 px-4 md:px-14">
                <div className='flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg md:rounded-full px-4 md:px-6 py-3 shadow-sm border border-gray-200 dark:border-gray-700'>
                    <Link to={""} className="text-lg md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Hadipharma
                    </Link>

                    <nav className='hidden md:flex items-center gap-5 text-gray-700 dark:text-gray-300 flex-1 ml-8'>
                        <Link to={"/"} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Accueil</Link>
                        <Link to={"/pharmacies"} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Pharmacies</Link>
                        <Link to={"/search"} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Recherche</Link>
                        <Link to={"/help"} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Aide</Link>
                    </nav>

                    <div className='hidden md:flex items-center gap-2 md:gap-4'>
                        <ThemeToggle />
                        <NotificationBell />
                        {isAuthenticated && (
                            <Link to={"/cart"} className='relative flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors'>
                                <LiaShoppingCartSolid size={24} className='md:w-6 md:h-6' />
                                {getTotalItems() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className='flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors'
                                >
                                    <LiaUser size={20} />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100 dark:border-gray-700">
                                        <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                                            <div className="font-medium">{user?.username}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                                        </div>
                                        {(user?.role === 'pharmacist' || user?.role === 'admin') && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <FiMapPin size={16} />
                                                Admin Panel
                                            </Link>
                                        )}
                                        {user?.role === 'superadmin' && (
                                            <Link
                                                to="/superadmin"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <FiMapPin size={16} />
                                                Super Admin
                                            </Link>
                                        )}
                                        <Link
                                            to="/profil"
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <LiaUser size={16} />
                                            Mon Profil
                                        </Link>
                                        <button
                                            onClick={() => setShowLogoutConfirm(true)}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors mt-1"
                                        >
                                            <LiaUser size={16} />
                                            Déconnexion
                                        </button>
                                    </div>
                                )}

                                {showLogoutConfirm && (
                                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center sm:p-6">
                                        <div className="absolute inset-0" onClick={() => setShowLogoutConfirm(false)} />
                                        <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl">
                                            <h2 className="text-xl font-bold mb-4 text-rose-600 dark:text-rose-400">Déconnexion</h2>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLogoutConfirm(false)}
                                                    className="flex-1 py-3 rounded-xl font-semibold bg-gray-50 dark:bg-slate-700 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="button"
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
                        ) : (
                            <Link to="/auth/login" className='hidden md:flex items-center justify-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-full hover:bg-emerald-700 transition-colors'>
                                Connexion
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
