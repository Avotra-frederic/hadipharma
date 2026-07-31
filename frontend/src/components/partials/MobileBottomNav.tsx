import { LiaHomeSolid, LiaSearchSolid, LiaUser, LiaShoppingCartSolid } from "react-icons/lia"
import { Link } from "react-router-dom"
import NotificationBell from "../notifications/NotificationBell"
import { useEffect, useRef, useState } from "react"

function MobileBottomNav() {
    const [visible, setVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const onScroll = () => {
            const current = window.scrollY
            if (current < 12 || current < lastScrollY.current) setVisible(true)
            else if (current > lastScrollY.current + 4) setVisible(false)
            lastScrollY.current = current
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 transition-transform duration-300 md:hidden ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className='flex items-center justify-around gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]'>
                <Link to="/" className='flex min-w-0 flex-1 flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaHomeSolid size={22} />
                    <span className='mt-1 max-w-full truncate text-[10px] sm:text-xs'>Accueil</span>
                </Link>

                <Link to="/search" className='flex min-w-0 flex-1 flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaSearchSolid size={22} />
                    <span className='mt-1 max-w-full truncate text-[10px] sm:text-xs'>Recherche</span>
                </Link>

                <Link to="/cart" className='flex min-w-0 flex-1 flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaShoppingCartSolid size={22} />
                    <span className='mt-1 max-w-full truncate text-[10px] sm:text-xs'>Panier</span>
                </Link>

                <div className='flex min-w-0 flex-1 flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <NotificationBell />
                    <span className='mt-1 max-w-full truncate text-[10px] sm:text-xs'>Alertes</span>
                </div>

                <Link to="/profil" className='flex min-w-0 flex-1 flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaUser size={22} />
                    <span className='mt-1 max-w-full truncate text-[10px] sm:text-xs'>Profil</span>
                </Link>
            </div>
        </nav>
    )
}

export default MobileBottomNav
