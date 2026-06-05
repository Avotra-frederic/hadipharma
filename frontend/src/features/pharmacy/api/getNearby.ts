import type { IPharmacy } from "../types";

export interface IUserLocation {
  lat: number;
  long: number;
}

export const getNearby = async (
  location: IUserLocation,
  radius = 100,
): Promise<IPharmacy[]> => {
  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/nearby`);
  url.searchParams.set("latitude", location.lat.toString());
  url.searchParams.set("longitude", location.long.toString());
  url.searchParams.set("radius", radius.toString());

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Cannot get nearby pharmacies");

  const result = await response.json();
  const pharmacies = Array.isArray(result) ? result : result.pharmacies || result.pharmacy;

  return Array.isArray(pharmacies) ? pharmacies : [];
};
