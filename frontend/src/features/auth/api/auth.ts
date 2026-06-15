import type { ILoginRequest, IRegisterRequest, IAuthResponse, IUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (credentials: ILoginRequest): Promise<IAuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies httpOnly
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
};

export const register = async (userData: IRegisterRequest): Promise<IAuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
};

export const logout = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }
};

export const checkEmailAvailability = async (email: string): Promise<{ available: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email check failed');
    }

    return response.json();
};

export const checkAuth = async (): Promise<IAuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Not authenticated');
    }

    return response.json();
};

export const updateProfile = async (userId: string, data: Partial<IUser>): Promise<{ message: string; user: IUser }> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
    }

    return response.json();
};

export const deleteAccount = async (userId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deletion failed');
    }

    return response.json();
};

export type PaymentMethod = {
    type: 'visa' | 'paypal' | 'mobile_money' | 'cash';
    last4?: string;
    holder?: string;
    expiry?: string;
    phone?: string;
    email?: string;
    isDefault?: boolean;
};

export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}/payment-methods`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch payment methods');
    }

    return response.json();
};

export const addPaymentMethod = async (userId: string, method: PaymentMethod): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}/payment-methods`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(method),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add payment method');
    }

    return response.json();
};

export const updatePaymentMethod = async (userId: string, index: number, data: Partial<PaymentMethod>): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}/payment-methods/${index}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update payment method');
    }

    return response.json();
};

export const deletePaymentMethod = async (userId: string, index: number): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}/payment-methods/${index}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete payment method');
    }

    return response.json();
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/${userId}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
    }

    return response.json();
};

export const uploadUserPhoto = async (userId: string, file: File): Promise<{ photo: string }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE_URL}/auth/${userId}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Photo upload failed');
    }

    return response.json();
};