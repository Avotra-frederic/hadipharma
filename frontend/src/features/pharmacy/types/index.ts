export interface IPharmacy {
  _id?: string;
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  phone: string;
  whatsapp?: string;
  photo?: string;
  openHours?: string;
  email?: string;
  is24: boolean;
  isActive: boolean;
  isOpen: boolean;
  rating?: number;
  reviews?: number;
  paymentSettings?: {
    visa?: {
      enabled?: boolean;
      cardNumber?: string;
      cardHolder?: string;
      merchantId?: string;
    };
    paypal?: {
      enabled?: boolean;
      email?: string;
    };
    mobileMoney?: {
      enabled?: boolean;
      provider?: string;
      number?: string;
      accountName?: string;
    };
  };
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
  subscriptionEndDate?: string;
  features?: string[];
  medications?: Array<{
    _id?: string;
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    requiresPrescription?: boolean;
    active?: boolean;
    photo?: string;
  }>;
}

export interface OrderItem {
  _id: string;
  orderReference?: string;
  pharmacyId: string;
  medications: Array<{ medicationName: string; quantity: number; price: number }>;
  total: number;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
  prescription?: { fileName?: string; status?: 'pending' | 'approved' | 'rejected' };
}
