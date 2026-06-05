export interface IMedication {
  _id: string;
  name: string;
  description?: string;
  category: string;
  requiresPrescription: boolean;
  price: number;
  active?: boolean;
  photo?: string;
  pharmacyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStock {
  _id: string;
  medicationId: string;
  medicationName?: string;
  pharmacyId: string;
  quantity: number;
  minQuantity: number;
  expiryDate?: string;
  updatedAt?: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  medications: {
    medicationId: string;
    medicationName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'visa' | 'paypal';
  pharmacyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPharmacyStats {
  totalOrders: number;
  pendingOrders: number;
  totalMedications: number;
  lowStockCount: number;
  todayRevenue: number;
}

export interface IMonthlySales {
  month: number;
  monthName: string;
  totalSales: number;
  ordersCount: number;
}

export interface IYearlySales {
  year: number;
  totalSales: number;
  ordersCount: number;
}

export interface IStockEvolution {
  month: number;
  category: string;
  totalQuantity: number;
  avgMinQuantity: number;
}

export interface ITopMedicine {
  name: string;
  category: string;
  totalRevenue: number;
  totalQuantity: number;
}

export interface IPurchase {
  _id: string;
  supplierId: string;
  supplierName?: string;
  supplierPhone?: string;
  medicines: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  pharmacyId: string;
  purchaseDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdminUser {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: 'client' | 'admin' | 'pharmacist';
  };
  permissions: {
    manageMedicines: boolean;
    manageStocks: boolean;
    manageOrders: boolean;
    managePurchases: boolean;
    viewStatistics: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}
