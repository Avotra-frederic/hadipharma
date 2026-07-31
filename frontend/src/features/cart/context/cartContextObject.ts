import { createContext } from 'react';
import type { Cart, CartItem } from '../types';

export interface CartContextType {
  cart: Cart;
  addToCart: (item: CartItem) => void;
  removeFromCart: (medicationId: string, pharmacyId: string) => void;
  updateQuantity: (medicationId: string, pharmacyId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
