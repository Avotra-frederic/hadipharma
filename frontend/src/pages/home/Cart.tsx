import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LiaArrowLeftSolid, LiaTrashSolid, LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia'
import { useCart } from '../../features/cart'
import { useTheme } from '../../features/theme'
import { useAuthContext } from '../../features/auth'
import { getUploadImageUrl } from '../../utils/image'

function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const { theme } = useTheme()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!user) {
      navigate('/auth/login')
    }
  }, [user, navigate])

  // Group items by pharmacy
  const itemsByPharmacy = cart.items.reduce((acc: Array<{ pharmacyId: string; pharmacyName: string; items: typeof cart.items }>, item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pharmacyGroup = acc.find((g: any) => g.pharmacyId === item.pharmacyId)
    if (pharmacyGroup) {
      pharmacyGroup.items.push(item)
    } else {
      acc.push({ pharmacyId: item.pharmacyId, pharmacyName: item.pharmacyName, items: [item] })
    }
    return acc
  }, [])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <LiaArrowLeftSolid size={24} />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mon Panier
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {cart.items.length} article(s)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {cart.items.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="text-5xl mb-4">🛒</div>
            <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Panier vide
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Commencez à ajouter des médicaments !
            </p>
            <Link
              to="/pharmacies"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Continuer les achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {itemsByPharmacy.map(group => (
                <div
                  key={group.pharmacyId}
                  className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm overflow-hidden`}
                >
                  {/* Pharmacy Header */}
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
                    <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {group.pharmacyName}
                    </h3>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.items.map(item => (
                      <div key={`${item.medicationId}-${item.pharmacyId}`} className="p-6 flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg flex items-center justify-center shrink-0">
                          {item.photo ? (
                            <img src={getUploadImageUrl(item.photo)} alt={item.medicationName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-3xl">💊</span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <div>
                              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.medicationName}
                              </h4>
                              {item.requiresPrescription && (
                                <span className="inline-flex text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-full mt-1">
                                  📋 Ordonnance requise
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.medicationId, item.pharmacyId)}
                              className={`p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
                            >
                              <LiaTrashSolid size={20} />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.medicationId, item.pharmacyId, item.quantity - 1)}
                                className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                              >
                                <LiaMinusSolid size={18} />
                              </button>
                              <span className={`w-8 text-center font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.medicationId, item.pharmacyId, item.quantity + 1)}
                                className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                              >
                                <LiaPlusSolid size={18} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.price.toFixed(2)} Ar x {item.quantity}
                              </p>
                              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {(item.price * item.quantity).toFixed(2)} Ar
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6 sticky top-24`}>
                <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Résumé de la commande
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Sous-total</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {getTotalPrice().toFixed(2)} Ar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Livraison</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Gratuit
                    </span>
                  </div>
                  <div className={`border-t pt-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                      <span className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {getTotalPrice().toFixed(2)} Ar
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-center transition-colors mb-3"
                >
                  Procéder au paiement
                </Link>
                <Link
                  to="/pharmacies"
                  className={`block w-full border ${theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} font-semibold py-3 rounded-lg text-center transition-colors`}
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
