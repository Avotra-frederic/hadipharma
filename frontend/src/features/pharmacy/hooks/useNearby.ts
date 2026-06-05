import { useEffect, useState } from "react";
import type { IPharmacy } from "../types";
import { getNearby, type IUserLocation } from "../api/getNearby";

const getDeviceLocation = (): Promise<IUserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.message || "Unable to access device location."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );
  });
};

export const useNearby = (radius = 100) => {
  const [data, setData] = useState<IPharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNearby = async () => {
      try {
        const location = await getDeviceLocation();
        const pharmacies = await getNearby(location, radius);
        if (isMounted) {
          setData(pharmacies);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to get nearby pharmacies.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNearby();

    return () => {
      isMounted = false;
    };
  }, [radius]);

  return { data, isLoading, error };
};
