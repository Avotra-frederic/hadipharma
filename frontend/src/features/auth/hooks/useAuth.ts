import { useState, useEffect, useCallback } from 'react';
import { login, register, logout, checkAuth, updateProfile, deleteAccount } from '../api/auth';
import type { ILoginRequest, IRegisterRequest, IAuthState, IUser } from '../types';

export const useAuth = () => {
    const [authState, setAuthState] = useState<IAuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Vérifier l'authentification au montage
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await checkAuth();
                setAuthState({
                    user: response.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? '' : 'failed';
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: errorMessage,
                });
            }
        };

        verifyAuth();
    }, []);

    const signIn = useCallback(async (credentials: ILoginRequest) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await login(credentials);
            setAuthState({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, []);

    const signUp = useCallback(async (userData: IRegisterRequest) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await register(userData);
            setAuthState({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            await logout();
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, []);

    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

     const refreshAuth = useCallback(async () => {
        try {
            const response = await checkAuth();
            setAuthState({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, []);

    const updateUserProfile = useCallback(async (data: Partial<IUser>) => {
        if (!authState.user) return;
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await updateProfile(authState.user._id, data);
            setAuthState(prev => ({
                ...prev,
                user: response.user,
                isLoading: false,
                error: null,
            }));
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Update failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, [authState.user]);

    const deleteUserAccount = useCallback(async () => {
        if (!authState.user) return;
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await deleteAccount(authState.user._id);
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Deletion failed';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            throw error;
        }
    }, [authState.user]);

    return {
        ...authState,
        signIn,
        signUp,
        signOut,
        clearError,
        refreshAuth,
        updateUserProfile,
        deleteUserAccount,
    };
};