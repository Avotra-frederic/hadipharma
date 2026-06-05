import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';


interface GuestRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const GuestRoute: React.FC<GuestRouteProps> = ({
    children,
    redirectTo = '/'
}) => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const location = useLocation();

    // Afficher un loader pendant la vérification de l'authentification
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900"></div>
            </div>
        );
    }

    // Rediriger vers la page d'accueil si déjà authentifié
    if (isAuthenticated) {
        // Rediriger vers la page demandée avant la redirection ou vers l'accueil
        const from = location.state?.from?.pathname || redirectTo;
        return <Navigate to={from} replace />;
    }

    // Afficher le contenu pour les invités si non authentifié
    return <>{children}</>;
};

export default GuestRoute;