import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../features/auth';
import { getPaymentMethods, addPaymentMethod as addPaymentMethodApi, updatePaymentMethod as updatePaymentMethodApi, deletePaymentMethod as deletePaymentMethodApi } from '../../features/auth/api/auth';
import { FiChevronLeft, FiCreditCard, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type PaymentMethod = {
    type: 'visa' | 'paypal' | 'mobile_money' | 'cash';
    last4?: string;
    holder?: string;
    expiry?: string;
    phone?: string;
    email?: string;
    isDefault?: boolean;
};

const ProfilePayments = () => {
    const { user } = useAuthContext();
    const [payments, setPayments] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<PaymentMethod>({
        type: 'visa',
        last4: '',
        holder: '',
        expiry: '',
        phone: '',
        email: '',
        isDefault: false,
    });

    const resetForm = () => {
        setFormData({
            type: 'visa',
            last4: '',
            holder: '',
            expiry: '',
            phone: '',
            email: '',
            isDefault: false,
        });
        setEditingIndex(null);
        setShowForm(false);
    };

    const fetchPayments = useCallback(async () => {
        if (!user?._id) return;
        try {
            const data = await getPaymentMethods(user._id);
            setPayments(data);
        } catch {
            console.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;

        try {
            if (editingIndex !== null) {
                await updatePaymentMethodApi(user._id, editingIndex, formData);
            } else {
                await addPaymentMethodApi(user._id, formData);
            }
            await fetchPayments();
            resetForm();
        } catch {
            alert('Erreur lors de l\'enregistrement du mode de paiement');
        }
    };

    const handleEdit = (index: number) => {
        const method = payments[index];
        setFormData({ ...method });
        setEditingIndex(index);
        setShowForm(true);
    };

    const handleDelete = async (index: number) => {
        if (!user?._id) return;
        if (!confirm('Supprimer ce mode de paiement ?')) return;
        try {
            await deletePaymentMethodApi(user._id, index);
            await fetchPayments();
        } catch {
            alert('Erreur lors de la suppression');
        }
    };

    const getMethodLabel = (method: PaymentMethod) => {
        switch (method.type) {
            case 'visa':
                return `Carte Visa •••• ${method.last4 || '0000'}`;
            case 'paypal':
                return `PayPal ${method.email || ''}`;
            case 'mobile_money':
                return `Mobile Money ${method.phone || ''}`;
            case 'cash':
                return 'Espèces';
            default:
                return method.type;
        }
    };

    const getMethodIcon = (type: string) => {
        const iconClass = 'text-xl';
        switch (type) {
            case 'visa':
                return <FiCreditCard className={`${iconClass} text-blue-500`} />;
            case 'paypal':
                return <FiCreditCard className={`${iconClass} text-blue-700`} />;
            case 'mobile_money':
                return <FiCreditCard className={`${iconClass} text-emerald-500`} />;
            default:
                return <FiCreditCard className={`${iconClass} text-gray-500`} />;
        }
    };

    const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/profil"
                        className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <FiChevronLeft size={22} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Modes de paiement</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Gérez vos méthodes de paiement enregistrées.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-slate-500">Chargement...</p>
                ) : (
                    <div className="space-y-4">
                        {payments.map((method, index) => (
                            <div
                                key={index}
                                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white border-slate-50 text-current">
                                            {getMethodIcon(method.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-gray-200">
                                                {getMethodLabel(method)}
                                            </p>
                                            {method.expiry && (
                                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                                    Expire {method.expiry}
                                                </p>
                                            )}
                                            {method.isDefault && (
                                                <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                                    Par défaut
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {payments.length === 0 && !showForm && (
                            <p className="text-center text-slate-500 text-sm">Aucun mode de paiement enregistré.</p>
                        )}

                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-gray-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                            >
                                <FiPlus size={20} />
                                <span className="text-sm font-bold">Ajouter un mode de paiement</span>
                            </button>
                        )}
                    </div>
                )}

                {showForm && (
                    <form onSubmit={handleSubmit} className="mt-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-gray-700 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">
                                {editingIndex !== null ? 'Modifier le mode de paiement' : 'Nouveau mode de paiement'}
                            </h2>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })}
                                className={inputClass}
                            >
                                <option value="visa">Carte Visa</option>
                                <option value="paypal">PayPal</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="cash">Espèces</option>
                            </select>
                        </div>

                        {formData.type === 'visa' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Numéro de carte</label>
                                    <input
                                        type="text"
                                        value={formData.last4 || ''}
                                        onChange={(e) => setFormData({ ...formData, last4: e.target.value.slice(-4) })}
                                        className={inputClass}
                                        placeholder="1234"
                                        maxLength={4}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Titulaire</label>
                                    <input
                                        type="text"
                                        value={formData.holder || ''}
                                        onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
                                        className={inputClass}
                                        placeholder="Nom sur la carte"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Expiration (MM/AA)</label>
                                    <input
                                        type="text"
                                        value={formData.expiry || ''}
                                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                        className={inputClass}
                                        placeholder="12/26"
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === 'paypal' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Email PayPal</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={inputClass}
                                    placeholder="email@paypal.com"
                                />
                            </div>
                        )}

                        {formData.type === 'mobile_money' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 mb-1">Numéro Mobile Money</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={inputClass}
                                    placeholder="034 12 345 67"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="isDefault" className="text-xs font-bold text-slate-600 dark:text-gray-400">
                                Mode de paiement par défaut
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 py-3 rounded-xl font-semibold bg-gray-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                                {editingIndex !== null ? 'Mettre à jour' : 'Ajouter'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePayments;
