import type { IPharmacy } from "../types";

export const getAllPharmacies = async(): Promise<IPharmacy[]> =>{
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/`);
    if(!response.ok) throw new Error("Cannot get pharmacies");
    const result = await response.json();
    const pharmacies = Array.isArray(result) ? result : result.pharmacy || result.pharmacies;
    return Array.isArray(pharmacies) ? pharmacies : [];
}