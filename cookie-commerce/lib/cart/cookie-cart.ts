// lib/cart/cookie-cart.ts

import { serialize, parse } from 'cookie';

export interface CartItemCookie {
  productId: string;
  quantity: number;
  priceAtAdd: number;
}

export interface CartCookie {
  items: CartItemCookie[];
  updatedAt: string;
}

const CART_COOKIE_NAME = 'guest_cart';
const CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 dana

/**
 * Parsira cart cookie iz request-a
 */
export function parseCartCookie(cookieHeader: string | null): CartCookie {
  if (!cookieHeader) {
    return { items: [], updatedAt: new Date().toISOString() };
  }

  const cookies = parse(cookieHeader);
  const cartData = cookies[CART_COOKIE_NAME];

  if (!cartData) {
    return { items: [], updatedAt: new Date().toISOString() };
  }

  try {
    const decoded = decodeURIComponent(cartData);
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (error) {
    console.error('Failed to parse cart cookie:', error);
    return { items: [], updatedAt: new Date().toISOString() };
  }
}

/**
 * Kreira Set-Cookie header za cart
 */
export function createCartCookie(cart: CartCookie): string {
  const value = encodeURIComponent(JSON.stringify(cart));

  return serialize(CART_COOKIE_NAME, value, {
    httpOnly: false, // Mora biti false da bi JavaScript mogao pristupiti
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Briše cart cookie
 */
export function deleteCartCookie(): string {
  return serialize(CART_COOKIE_NAME, '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Dodaje proizvod u cart cookie
 */
export function addItemToCartCookie(
  cart: CartCookie,
  productId: string,
  quantity: number,
  price: number
): CartCookie {
  const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

  if (existingItemIndex >= 0) {
    // Proizvod već postoji - ažuriraj količinu
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Novi proizvod
    cart.items.push({
      productId,
      quantity,
      priceAtAdd: price,
    });
  }

  cart.updatedAt = new Date().toISOString();
  return cart;
}

/**
 * Uklanja proizvod iz cart cookie
 */
export function removeItemFromCartCookie(cart: CartCookie, productId: string): CartCookie {
  cart.items = cart.items.filter((item) => item.productId !== productId);
  cart.updatedAt = new Date().toISOString();
  return cart;
}

/**
 * Ažurira količinu proizvoda u cart cookie
 */
export function updateItemQuantityInCartCookie(
  cart: CartCookie,
  productId: string,
  quantity: number
): CartCookie {
  const itemIndex = cart.items.findIndex((item) => item.productId === productId);

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Ako je količina 0 ili manje, ukloni proizvod
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  cart.updatedAt = new Date().toISOString();
  return cart;
}

/**
 * Čisti celu korpu
 */
export function clearCartCookie(): CartCookie {
  return {
    items: [],
    updatedAt: new Date().toISOString(),
  };
}