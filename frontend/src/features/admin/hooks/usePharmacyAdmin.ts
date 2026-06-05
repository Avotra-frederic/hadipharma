import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../auth/hooks/useAuthContext';
import { findPharmacyByUser, allPharmacy } from '../api/admin';
import type { IPharmacy } from '../../pharmacy/types';

export const usePharmacyAdmin = () => {
  const { user } = useAuthContext();
  const [pharmacy, setPharmacy] = useState<IPharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-select pharmacy if user is pharmacy admin
  useEffect(() => {
    const loadPharmacy = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try to find pharmacy owned by this user
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/user/${user._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setPharmacy(data);
          setError(null);
        } else {
          setPharmacy(null);
        }
      } catch (err) {
        console.error('Error loading pharmacy:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pharmacy');
        setPharmacy(null);
      } finally {
        setLoading(false);
      }
    };

    loadPharmacy();
  }, [user?._id]);

  return { pharmacy, loading, error, isPharmacyAdmin: !!pharmacy };
};
