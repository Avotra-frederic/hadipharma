import type { IPharmacy } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getPharmacy = async(id:string):Promise<IPharmacy> =>{
    const response = await fetch(`${API_BASE_URL}/pharmacy/${id}`);
    if(!response.ok) throw new Error("Cannot find pharmacy");
    const result = await response.json();

    if (result && typeof result === 'object') {
        return 'pharmacy' in result ? result.pharmacy as IPharmacy : result as IPharmacy;
    }

    return {} as IPharmacy;
}