import React, { useState, useEffect } from 'react';
import type { CartItem, Cart } from '../types';
import { CartContext } from './cartContextObject';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
    return { items: [], total: 0 };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(
        item => item.medicationId === newItem.medicationId && item.pharmacyId === newItem.pharmacyId
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = prevCart.items.map(item =>
          item.medicationId === newItem.medicationId && item.pharmacyId === newItem.pharmacyId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedItems = [...prevCart.items, newItem];
      }

      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    });
  };

  const removeFromCart = (medicationId: string, pharmacyId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(
        item => !(item.medicationId === medicationId && item.pharmacyId === pharmacyId)
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    });
  };

  const updateQuantity = (medicationId: string, pharmacyId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicationId, pharmacyId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.medicationId === medicationId && item.pharmacyId === pharmacyId
          ? { ...item, quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const getTotalItems = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.total;
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
