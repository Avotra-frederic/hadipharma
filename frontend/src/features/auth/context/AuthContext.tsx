import { createContext} from 'react';
import type { IAuthState } from '../types';

export interface IAuthContext extends IAuthState {
    signIn: (credentials: { email: string; password: string }) => Promise<unknown>;
    signUp: (userData: { username: string; email: string; password: string; confirmPassword: string }) => Promise<unknown>;
    signOut: () => Promise<void>;
    clearError: () => void;
    refreshAuth: () => Promise<void>;
    updateUserProfile: (data: Partial<IUser>) => Promise<unknown>;
    deleteUserAccount: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default AuthContext;

