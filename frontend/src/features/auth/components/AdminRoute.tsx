import React from 'react';
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Vérifier si l'utilisateur est admin OU pharmacist (propriétaire d'une pharmacie)
    if (user?.role !== 'admin' && user?.role !== 'pharmacist') {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
