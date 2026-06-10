// Admin Dashboard Services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});

export const getAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch admin stats');
  return response.json();
};

export const getAllPharmaciesAdmin = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch pharmacies');
  const data = await response.json();
  return data.pharmacies || data;
};

export const getPharmacyDetailsAdmin = async (pharmacyId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies/${pharmacyId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch pharmacy details');
  const data = await response.json();
  return data.pharmacy || data;
};

export const updatePharmacySubscriptionAdmin = async (
  pharmacyId: string,
  data: { status?: string; endDate?: string; features?: Record<string, unknown> }
) => {
  const response = await fetch(`${API_BASE_URL}/admin/pharmacies/${pharmacyId}/subscription`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update pharmacy subscription');
  const result = await response.json();
  return result.pharmacy || result;
};

export const getSalesByMonthAdmin = async (year?: number) => {
  const queryYear = year || new Date().getFullYear();
  const response = await fetch(`${API_BASE_URL}/admin/stats/sales-by-month?year=${queryYear}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch monthly sales');
  return response.json();
};

export const getSalesByYearAdmin = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats/sales-by-year`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch yearly sales');
  return response.json();
};

export const getStockEvolutionAdmin = async (
  pharmacyId: string,
  period: 'monthly' | 'yearly' = 'monthly'
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/stats/stock-evolution?pharmacyId=${pharmacyId}&period=${period}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  if (!response.ok) throw new Error('Failed to fetch stock evolution');
  return response.json();
};

export const getTopMedicinesByAdmin = async (
  pharmacyId: string,
  period: 'monthly' | 'yearly' = 'monthly',
  limit: number = 10
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/stats/top-medicines?pharmacyId=${pharmacyId}&period=${period}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    }
  );
  if (!response.ok) throw new Error('Failed to fetch top medicines');
  return response.json();
};
