import { useContext } from "react";
import type { IAuthContext } from "../context/AuthContext";
import AuthContext from "../context/AuthContext";

export const useAuthContext = (): IAuthContext => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};