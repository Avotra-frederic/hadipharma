import { API_BASE_URL } from '../../../utils/constants';

export const getPopularPharmacies = async () => {
  const response = await fetch(`${API_BASE_URL}/pharmacy/popular`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular pharmacies');
  }

  return response.json();
};
