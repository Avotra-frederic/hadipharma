export const createPharmacy = async (pharmacyData: FormData): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/store`, {
    method: 'POST',
    body: pharmacyData,
    credentials: 'include', // Important pour envoyer les cookies (auth_token)
    // Do NOT set Content-Type header when using FormData - browser will set it with boundary
  });

  const respBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(respBody.message || "Erreur lors de l'enregistrement de la pharmacie");
  }

  return respBody;
};