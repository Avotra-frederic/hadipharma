export interface CartItem {
  medicationId: string;
  medicationName: string;
  price: number;
  quantity: number;
  pharmacyId: string;
  pharmacyName: string;
  requiresPrescription: boolean;
  photo?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
