import type { IPharmacy } from "../types";

export const createPharmacy = async (pharmacyData: FormData): Promise<IPharmacy> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/store`, {
    method: 'POST',
    body: pharmacyData,
    credentials: 'include', // Important pour envoyer les cookies (auth_token)
    // Do NOT set Content-Type header when using FormData - browser will set it with boundary
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de l'enregistrement de la pharmacie");
  }

  return response.json();
};