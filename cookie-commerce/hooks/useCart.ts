// hooks/useCart.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  productId: string;
  quantity: number;
  priceAtAdd: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
  };
}

export interface Cart {
  id?: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  source: 'database' | 'cookie';
}

/**
 * Custom hook za upravljanje korpom
 * 
 * @example
 * const { cart, addItem, updateQuantity, removeItem, clearCart, isLoading } = useCart();
 */
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // FETCH CART
  // ==========================================

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Greška pri učitavanju korpe');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err: any) {
      console.error('Fetch cart error:', err);
      setError(err.message || 'Došlo je do greške');
      
      // Postavi praznu korpu u slučaju greške
      setCart({
        items: [],
        totalAmount: 0,
        itemCount: 0,
        source: 'cookie',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ==========================================
  // ADD ITEM TO CART
  // ==========================================

  const addItem = async (productId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri dodavanju u korpu');
      }

      // Refresh cart
      await fetchCart();

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('Add to cart error:', err);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // UPDATE ITEM QUANTITY
  // ==========================================

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri ažuriranju količine');
      }

      // Refresh cart
      await fetchCart();

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('Update quantity error:', err);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // REMOVE ITEM FROM CART
  // ==========================================

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri uklanjanju iz korpe');
      }

      // Refresh cart
      await fetchCart();

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('Remove from cart error:', err);
      return { success: false, error: err.message };
    }
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri čišćenju korpe');
      }

      // Refresh cart
      await fetchCart();

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('Clear cart error:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    cart,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart,
  };
}