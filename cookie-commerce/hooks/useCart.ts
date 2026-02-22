// hooks/useCart.ts
// Re-export from context for backward compatibility
'use client';

export { useCart } from '@/context/CartContext';
export type { Cart, CartItem } from '@/context/CartContext';