import type { IMedication, IStock, IOrder, IPharmacyStats, IPurchase, IAdminUser } from '../types';
import type { IPharmacy } from '../../pharmacy/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});

export const getMedications = async (pharmacyId: string): Promise<IMedication[]> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/medications`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch medications');
  return response.json();
};

export const createMedication = async (pharmacyId: string, data: Partial<IMedication>, photo?: File): Promise<IMedication> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify({
    ...data,
    price: Number(data.price)
  }));
  if (photo) {
    formData.append('photo', photo);
  }
  
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/medications`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to create medication');
  return response.json();
};

export const updateMedication = async (pharmacyId: string, medicationId: string, data: Partial<IMedication>, photo?: File): Promise<IMedication> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify({
    ...data,
    price: Number(data.price)
  }));
  if (photo) {
    formData.append('photo', photo);
  }
  
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/medications/${medicationId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to update medication');
  return response.json();
};

export const deleteMedication = async (pharmacyId: string, medicationId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/medications/${medicationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete medication');
};

export const getStocks = async (pharmacyId: string): Promise<IStock[]> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/stocks`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch stocks');
  return response.json();
};

export const updateStock = async (pharmacyId: string, medicationId: string, quantity: number): Promise<IStock> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/stocks/${medicationId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to update stock');
  return response.json();
};

export const getOrders = async (pharmacyId: string): Promise<IOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const updateOrderStatus = async (pharmacyId: string, orderId: string, status: IOrder['status']): Promise<IOrder> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/orders/${orderId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
};

export const getPharmacyStats = async (pharmacyId: string): Promise<IPharmacyStats> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

export const getPurchases = async (pharmacyId: string): Promise<IPurchase[]> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/purchases`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch purchases');
  return response.json();
};

export const updatePurchaseStatus = async (pharmacyId: string, purchaseId: string, status: IPurchase['status']): Promise<IPurchase> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/purchases/${purchaseId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update purchase');
  return response.json();
};

export const getPharmacyAdmins = async (pharmacyId: string): Promise<IAdminUser[]> => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/${pharmacyId}/admins`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch pharmacy admins');
  return response.json();
};

export const getAllPharmacies = async (): Promise<{ pharmacies: IPharmacy[] }> => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch pharmacies');
  return response.json();
};

export const getPharmacyDetails = async (pharmacyId: string): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies/${pharmacyId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch pharmacy details');
  return response.json();
};

export const updatePharmacySubscription = async (pharmacyId: string, data: unknown): Promise<unknown> => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies/${pharmacyId}/subscription`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update subscription');
  return response.json();
};