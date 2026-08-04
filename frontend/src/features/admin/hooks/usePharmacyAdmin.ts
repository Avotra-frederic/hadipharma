import { useState, useEffect } from 'react';
import { useAuthContext } from '../../auth/hooks/useAuthContext';
import type { IPharmacy } from '../../pharmacy/types';
import type { IAdminUser } from '../types';

const defaultPermissions: IAdminUser['permissions'] = {
  manageMedicines: false,
  manageStocks: false,
  manageOrders: false,
  managePurchases: false,
  viewStatistics: false,
  manageUsers: false,
  manageSettings: false,
};

interface UsePharmacyAdminOptions {
  skipPermissionsFetch?: boolean;
}

export const usePharmacyAdmin = (options: UsePharmacyAdminOptions = {}) => {
  const { user } = useAuthContext();
  const [pharmacy, setPharmacy] = useState<IPharmacy | null>(null);
  const [permissions, setPermissions] = useState<IAdminUser['permissions'] | null>(null);
  const [adminAccount, setAdminAccount] = useState<IAdminUser | null>(null);
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
          const selectedPharmacy = data.pharmacy || data;
          setPharmacy(selectedPharmacy);
          setPermissions(defaultPermissions);
          setAdminAccount(null);

          const isOwner = selectedPharmacy?.user_id?.toString() === user._id;
          if (isOwner) {
            setPermissions({
              manageMedicines: true,
              manageStocks: true,
              manageOrders: true,
              managePurchases: true,
              viewStatistics: true,
              manageUsers: true,
              manageSettings: true,
            });
          }

          if (selectedPharmacy?._id && !options.skipPermissionsFetch) {
            const adminsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pharmacy/${selectedPharmacy._id}/admins`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            if (adminsResponse.ok) {
              const admins = await adminsResponse.json() as IAdminUser[];
              const currentAdmin = admins.find(admin => admin.user._id === user._id) || null;
              setAdminAccount(currentAdmin);
              if (!isOwner) {
                setPermissions(currentAdmin?.permissions || defaultPermissions);
              }
            }
          }
          setError(null);
        } else {
          setPharmacy(null);
          setPermissions(null);
          setAdminAccount(null);
        }
      } catch (err) {
        console.error('Error loading pharmacy:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pharmacy');
        setPharmacy(null);
        setPermissions(null);
        setAdminAccount(null);
      } finally {
        setLoading(false);
      }
    };

    loadPharmacy();
  }, [user?._id, options.skipPermissionsFetch]);

  return { pharmacy, permissions, adminAccount, loading, error, isPharmacyAdmin: !!pharmacy };
};
