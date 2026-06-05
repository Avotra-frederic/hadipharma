import type { IPharmacy } from "../types";

export const getFeatured = async(): Promise<IPharmacy[]> =>{
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/`);
    if(!response.ok) throw new Error("Cannot get pharmacy");

    const result = await response.json();
    const pharmacies = Array.isArray(result) ? result : result.pharmacy;

    if (!Array.isArray(pharmacies)) return [];

    return pharmacies.filter((pharmacy) => pharmacy?.is24 === true);
} 