// context/CartContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    addItem: (productId: string, quantity?: number) => Promise<{ success: boolean; message?: string; error?: string }>;
    updateQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; message?: string; error?: string }>;
    removeItem: (productId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
    clearCart: () => Promise<{ success: boolean; message?: string; error?: string }>;
    refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

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

            await fetchCart();
            return { success: true, message: data.message };
        } catch (err: any) {
            console.error('Add to cart error:', err);
            return { success: false, error: err.message };
        }
    };

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

            await fetchCart();
            return { success: true, message: data.message };
        } catch (err: any) {
            console.error('Update quantity error:', err);
            return { success: false, error: err.message };
        }
    };

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

            await fetchCart();
            return { success: true, message: data.message };
        } catch (err: any) {
            console.error('Remove from cart error:', err);
            return { success: false, error: err.message };
        }
    };

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

            await fetchCart();
            return { success: true, message: data.message };
        } catch (err: any) {
            console.error('Clear cart error:', err);
            return { success: false, error: err.message };
        }
    };

    return (
        <CartContext.Provider value={{ cart, isLoading, error, addItem, updateQuantity, removeItem, clearCart, refetch: fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
