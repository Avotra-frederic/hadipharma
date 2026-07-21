import type { IPharmacy } from "../types";

export const getFeatured = async(): Promise<IPharmacy[]> =>{
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/popular`);
        if(!response.ok) throw new Error("Cannot get popular pharmacies");

        const result = await response.json();
        const pharmacies = Array.isArray(result.pharmacies) ? result.pharmacies : [];

        if (!Array.isArray(pharmacies)) return [];

        return pharmacies;
    } catch (error) {
        console.error("Error fetching featured pharmacies:", error);
        return [];
    }
} 