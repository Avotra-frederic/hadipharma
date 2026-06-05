import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';


interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    redirectTo = '/auth/login'
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

    // Rediriger vers la page de login si non authentifié
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Afficher le contenu protégé si authentifié
    return <>{children}</>;
};

export default ProtectedRoute;