import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({
    children,
    redirectTo = '/auth/login'
}) => {
    const { user, isAuthenticated, isLoading } = useAuthContext();
    const location = useLocation();
    const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);
    const [checkingSubscription, setCheckingSubscription] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user?._id || (user.role !== 'admin' && user.role !== 'pharmacist')) {
                return;
            }

            setCheckingSubscription(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/user/${user._id}`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const pharmacy = await response.json();
                    if (!pharmacy.isActive) {
                        setSubscriptionBlocked(true);
                        return;
                    }
                    if (pharmacy.subscriptionEndDate && new Date(pharmacy.subscriptionEndDate) < new Date()) {
                        setSubscriptionBlocked(true);
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to check subscription status:', error);
            } finally {
                setCheckingSubscription(false);
            }
        };

        checkSubscription();
    }, [user]);

    if (isLoading || checkingSubscription) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin' && user?.role !== 'pharmacist') {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (subscriptionBlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-xl">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                        Accès restreint
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Votre abonnement a expiré ou votre pharmacie est désactivée. Veuillez renouveler votre abonnement pour accéder au panneau d'administration.
                    </p>
                    <a
                        href="/profil"
                        className="inline-block px-6 py-3 bg-sky-900 text-white rounded-2xl font-bold hover:bg-sky-800 transition-colors"
                    >
                        Gérer mon abonnement
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminRoute;
