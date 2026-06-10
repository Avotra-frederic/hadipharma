import { useState, useEffect, useCallback } from 'react';
import type { IMedication, IStock, IOrder, IPharmacyStats, IPurchase, IAdminUser } from '../types';
import * as adminApi from '../api/admin';

export function useMedications(pharmacyId: string) {
  const [data, setData] = useState<IMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getMedications(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching medications');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (medication: Partial<IMedication>, photo?: File) => {
    const result = await adminApi.createMedication(pharmacyId, medication, photo);
    setData(prev => [...prev, result]);
    return result;
  };

  const update = async (id: string, medication: Partial<IMedication>, photo?: File) => {
    const result = await adminApi.updateMedication(pharmacyId, id, medication, photo);
    setData(prev => prev.map(m => m._id === id ? result : m));
    return result;
  };

  const remove = async (id: string) => {
    await adminApi.deleteMedication(pharmacyId, id);
    setData(prev => prev.filter(m => m._id !== id));
  };

  return { data, isLoading, error, refetch: fetch, create, update, remove };
}

export function useStocks(pharmacyId: string) {
  const [data, setData] = useState<IStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getStocks(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stocks');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = async (medicationId: string, quantity: number) => {
    const result = await adminApi.updateStock(pharmacyId, medicationId, quantity);
    setData(prev => prev.map(s => s.medicationId === medicationId ? result : s));
    return result;
  };

  return { data, isLoading, error, refetch: fetch, update };
}

export function useOrders(pharmacyId: string) {
  const [data, setData] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getOrders(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = async (orderId: string, status: IOrder['status']) => {
    const result = await adminApi.updateOrderStatus(pharmacyId, orderId, status);
    setData(prev => prev.map(o => o._id === orderId ? result : o));
    return result;
  };

  return { data, isLoading, error, refetch: fetch, updateStatus };
}

export function usePurchases(pharmacyId: string) {
  const [data, setData] = useState<IPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getPurchases(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching purchases');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateStatus = async (purchaseId: string, status: IPurchase['status']) => {
    const result = await adminApi.updatePurchaseStatus(pharmacyId, purchaseId, status);
    setData(prev => prev.map(p => p._id === purchaseId ? result : p));
    return result;
  };

  return { data, isLoading, error, refetch: fetch, updateStatus };
}

export function useAdminUsers(pharmacyId: string) {
  const [data, setData] = useState<IAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getPharmacyAdmins(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching pharmacy admins');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addUser = async (payload: adminApi.AddPharmacyUserPayload) => {
    const result = await adminApi.addPharmacyUser(pharmacyId, payload);
    setData(prev => [...prev, result]);
    return result;
  };

  const updateRole = async (userId: string, role: string) => {
    const result = await adminApi.updatePharmacyUserRole(pharmacyId, userId, role);
    setData(prev => prev.map(item => item.user._id === userId ? { ...item, user: { ...item.user, role: result.role } } : item));
    return result;
  };

  const removeUser = async (userId: string) => {
    await adminApi.removePharmacyUser(pharmacyId, userId);
    setData(prev => prev.filter(item => item.user._id !== userId));
  };

  const updatePermissions = async (adminId: string, permissions: Record<string, boolean>) => {
    const result = await adminApi.updatePharmacyAdminPermissions(pharmacyId, adminId, permissions);
    setData(prev => prev.map(item => item._id === adminId ? { ...item, permissions: result.permissions } : item));
    return result;
  };

  const toggleActive = async (adminId: string, active: boolean) => {
    const result = await adminApi.togglePharmacyAdminActive(pharmacyId, adminId, active);
    setData(prev => prev.map(item => item._id === adminId ? { ...item, active: result.active } : item));
    return result;
  };

  return { data, isLoading, error, refetch: fetch, addUser, updateRole, removeUser, updatePermissions, toggleActive };
}

export function usePharmacyStats(pharmacyId: string) {
  const [data, setData] = useState<IPharmacyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!pharmacyId) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getPharmacyStats(pharmacyId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
