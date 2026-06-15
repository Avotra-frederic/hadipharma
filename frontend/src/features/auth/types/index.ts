export interface IUser {
    _id: string;
    username: string;
    email: string;
    role: 'client' | 'admin' | 'pharmacist' | 'superadmin';
    photo?: string | null;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface IAuthResponse {
    user: IUser;
    token: string;
}

export interface IAuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface IAuthContext extends IAuthState {
    signIn: (credentials: { email: string; password: string }) => Promise<unknown>;
    signUp: (userData: { username: string; email: string; password: string; confirmPassword: string }) => Promise<unknown>;
    signOut: () => Promise<void>;
    clearError: () => void;
    refreshAuth: () => Promise<void>;
}