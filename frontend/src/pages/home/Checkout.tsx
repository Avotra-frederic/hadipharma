import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LiaArrowLeftSolid, LiaCheckCircleSolid, LiaInfoCircleSolid } from 'react-icons/lia'
import { useCart } from '../../features/cart'
import { useTheme } from '../../features/theme'
import { useAuthContext } from '../../features/auth'
import { useToast } from '../../features/ui/toast'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  prescriptionRequired: boolean
  prescriptionFile?: File
  paymentMethod: 'cash' | 'visa' | 'paypal' | 'mobile_money'
  visaCardNumber: string
  visaCardHolder: string
  visaExpiry: string
  visaCvv: string
  paypalEmail: string
  mobileMoneyPhone: string
  notes: string
}

function Checkout() {
  const { cart, clearCart, getTotalPrice } = useCart()
  const { theme } = useTheme()
  const { user } = useAuthContext()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.username?.split(' ')[0] || '',
    lastName: user?.username?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    prescriptionRequired: false,
    paymentMethod: 'cash',
    visaCardNumber: '',
    visaCardHolder: '',
    visaExpiry: '',
    visaCvv: '',
    paypalEmail: '',
    mobileMoneyPhone: '',
    notes: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    if (cart.items.length === 0) {
      navigate('/cart')
    }
  }, [user, cart.items.length, navigate])

  const hasPrescriptionMeds = cart.items.some(item => item.requiresPrescription)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: target.checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, prescriptionFile: e.target.files?.[0] }))
    }
  }

  const getItemsByPharmacy = () => {
    return cart.items.reduce(
      (acc: Array<{ pharmacyId: string; pharmacyName: string; items: typeof cart.items }>, item) => {
        const pharmacyGroup = acc.find(g => g.pharmacyId === item.pharmacyId)
        if (pharmacyGroup) {
          pharmacyGroup.items.push(item)
        } else {
          acc.push({ pharmacyId: item.pharmacyId, pharmacyName: item.pharmacyName, items: [item] })
        }
        return acc
      },
      [] as Array<{ pharmacyId: string; pharmacyName: string; items: typeof cart.items }>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city) {
      showToast('Veuillez remplir tous les champs requis', 'error')
      return
    }

    if (hasPrescriptionMeds && !formData.prescriptionFile) {
      showToast('Veuillez télécharger votre ordonnance pour commander ces médicaments', 'error')
      return
    }

    if (formData.paymentMethod === 'visa' && (!formData.visaCardNumber || !formData.visaCardHolder || !formData.visaExpiry || !formData.visaCvv)) {
      showToast('Veuillez remplir les informations Visa', 'error')
      return
    }

    if (formData.paymentMethod === 'paypal' && !formData.paypalEmail) {
      showToast('Veuillez renseigner votre email PayPal', 'error')
      return
    }

    if (formData.paymentMethod === 'mobile_money' && !formData.mobileMoneyPhone) {
      showToast('Veuillez renseigner votre numéro Mobile Money', 'error')
      return
    }

    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
      const itemsByPharmacy = getItemsByPharmacy()

      const createRequests = itemsByPharmacy.map(group => {
        const orderData = {
          user: user?._id,
          medicines: group.items.map(item => ({ medicine: item.medicationId, quantity: item.quantity, price: item.price })),
          totalAmount: group.items.reduce((s, it) => s + it.price * it.quantity, 0),
          paymentMethod: formData.paymentMethod,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            notes: formData.notes
          },
          paymentDetails: {
            cardLast4: formData.paymentMethod === 'visa' ? formData.visaCardNumber.replace(/\s/g, '').slice(-4) : '',
            paypalEmail: formData.paymentMethod === 'paypal' ? formData.paypalEmail : '',
            mobileMoneyPhone: formData.paymentMethod === 'mobile_money' ? formData.mobileMoneyPhone : ''
          }
        }

        const formDataPayload = new FormData()
        formDataPayload.append('data', JSON.stringify(orderData))
        if (formData.prescriptionFile) {
          formDataPayload.append('prescription', formData.prescriptionFile)
        }

        return fetch(`${API_BASE_URL}/pharmacy/${group.pharmacyId}/orders`, {
          method: 'POST',
          body: formDataPayload,
          credentials: 'include',
        }).then(async res => {
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            throw new Error(text || 'Failed to create order')
          }
          return res.json()
        })
      })

      await Promise.all(createRequests)
      setSubmitted(true)
      clearCart()
      showToast('Commande créée avec succès', 'success')
    } catch (error) {
      console.error(error)
      showToast(error instanceof Error ? error.message : 'Erreur lors de la création de la commande', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Group items by pharmacy for display
  const itemsByPharmacy = getItemsByPharmacy()

  if (submitted) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center px-4`}>
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 md:p-10 text-center max-w-md`}>
          <div className="text-6xl mb-6">
            <LiaCheckCircleSolid className="w-20 h-20 mx-auto text-emerald-600" />
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Commande confirmée !
          </h2>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Merci pour votre commande. Vous recevrez un email de confirmation bientôt.
          </p>
          <Link
            to="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <LiaArrowLeftSolid size={24} />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Vérification
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Finalisez votre commande
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Adresse de livraison
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Adresse complète"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="Ville"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Méthode de paiement
              </h3>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
              >
                <option value="cash">💵 Paiement en espèces</option>
                <option value="visa">💳 Carte Visa</option>
                <option value="paypal">🅿️ PayPal</option>
                <option value="mobile_money">📱 Mobile Money</option>
              </select>

              {formData.paymentMethod === 'visa' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    name="visaCardHolder"
                    placeholder="Nom sur la carte"
                    value={formData.visaCardHolder}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                  <input
                    type="text"
                    name="visaCardNumber"
                    placeholder="Numéro de carte Visa"
                    value={formData.visaCardNumber}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                  <input
                    type="text"
                    name="visaExpiry"
                    placeholder="MM/AA"
                    value={formData.visaExpiry}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                  <input
                    type="password"
                    name="visaCvv"
                    placeholder="CVV"
                    value={formData.visaCvv}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                </div>
              )}

              {formData.paymentMethod === 'paypal' && (
                <input
                  type="email"
                  name="paypalEmail"
                  placeholder="Email PayPal"
                  value={formData.paypalEmail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border mt-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
              )}

              {formData.paymentMethod === 'mobile_money' && (
                <div className="mt-4 space-y-3">
                  <input
                    type="tel"
                    name="mobileMoneyPhone"
                    placeholder="Numéro Mobile Money"
                    value={formData.mobileMoneyPhone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    La pharmacie vous enverra par email la référence de commande après approbation.
                  </p>
                </div>
              )}
            </div>

            {/* Prescription Section */}
            {hasPrescriptionMeds && (
              <div className={`${theme === 'dark' ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-200'} rounded-2xl border shadow-sm p-6`}>
                <div className="flex gap-3 mb-4">
                  <LiaInfoCircleSolid className="text-rose-600 dark:text-rose-400 shrink-0" size={24} />
                  <div>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-rose-400' : 'text-rose-800'}`}>
                      Ordonnance requise
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-rose-300' : 'text-rose-700'}`}>
                      Certains médicaments de votre commande nécessitent une ordonnance médicale.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="prescriptionRequired"
                    checked={formData.prescriptionRequired}
                    onChange={handleInputChange}
                    id="prescriptionRequired"
                    className="w-5 h-5 rounded border-gray-300 text-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="prescriptionRequired" className={`text-sm font-medium cursor-pointer ${theme === 'dark' ? 'text-rose-300' : 'text-rose-700'}`}>
                    Je possède une ordonnance médicale valide
                  </label>
                </div>

                {formData.prescriptionRequired && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Télécharger l'ordonnance (PDF, JPG, PNG)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                    {formData.prescriptionFile && (
                      <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ✓ {formData.prescriptionFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notes additionnelles
              </h3>
              <textarea
                name="notes"
                placeholder="Ajoutez des instructions spéciales pour la livraison..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors"
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-6 sticky top-24`}>
              <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Résumé de la commande
              </h3>

              {/* Items by Pharmacy */}
              <div className="space-y-4 mb-6">
                {itemsByPharmacy.map(group => (
                  <div key={group.pharmacyId}>
                    <p className={`font-semibold text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {group.pharmacyName}
                    </p>
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <div key={`${item.medicationId}-${item.pharmacyId}`} className="flex justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {item.medicationName} x {item.quantity}
                          </span>
                          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between mb-3">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Sous-total</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getTotalPrice().toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Livraison</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Gratuit
                  </span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {getTotalPrice().toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
