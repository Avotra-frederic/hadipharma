import { createContext } from 'react';

export interface CartContextType {
  cart: { items: Array<{ medicationId: string; pharmacyId: string; quantity: number; price: number }>; total: number };
  addToCart: (item: { medicationId: string; pharmacyId: string; quantity: number; price: number }) => void;
  removeFromCart: (medicationId: string, pharmacyId: string) => void;
  updateQuantity: (medicationId: string, pharmacyId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
