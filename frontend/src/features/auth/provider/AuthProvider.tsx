import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthContext from "../context/AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

 const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider