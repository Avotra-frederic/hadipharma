import { useState } from 'react';

export const useGeocoding = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const getCoordinates = async (address: string): Promise<[number, number] | null> => {
    if (!address || address.length < 5) return null;

    setIsGeocoding(true);
    setGeoError(null);

    try {
      // Utilisation de l'API Nominatim (OpenStreetMap) - Gratuite et sans clé pour test
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) throw new Error("Erreur de réseau");
      
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        // Mongoose 2dsphere index: [longitude, latitude]
        return [parseFloat(lon), parseFloat(lat)];
      } else {
        setGeoError("Aucune coordonnée trouvée pour cette adresse.");
        return null;
      }
    } catch (err) {
      console.error(err);
      setGeoError("Erreur lors de la récupération des coordonnées GPS.");
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  return { getCoordinates, isGeocoding, geoError };
};