import { LiaHomeSolid, LiaSearchSolid, LiaUser, LiaShoppingCartSolid } from "react-icons/lia"
import { Link } from "react-router-dom"

function MobileBottomNav() {
    return (
        <nav className='fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden'>
            <div className='flex items-center justify-around py-3 px-4'>
                <Link to="/" className='flex flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaHomeSolid size={24} />
                    <span className='text-xs mt-1'>Home</span>
                </Link>

                <Link to="/search" className='flex flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaSearchSolid size={24} />
                    <span className='text-xs mt-1'>Search</span>
                </Link>

                <Link to="/cart" className='flex flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaShoppingCartSolid size={24} />
                    <span className='text-xs mt-1'>Cart</span>
                </Link>

                <Link to="/profil" className='flex flex-col items-center justify-center text-gray-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors'>
                    <LiaUser size={24} />
                    <span className='text-xs mt-1'>Profile</span>
                </Link>
            </div>
        </nav>
    )
}

export default MobileBottomNav