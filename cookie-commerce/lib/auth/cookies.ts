// lib/auth/cookies.ts

import { serialize, parse } from 'cookie';
import type { NextRequest } from 'next/server';

export const COOKIE_NAMES = {
  SESSION_TOKEN: 'session_token',
  REMEMBER_TOKEN: 'remember_token',
  CART_ID: 'cart_id',
  PREFERENCES: 'user_preferences',
  CONSENT: 'cookie_consent',
} as const;

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

/**
 * Kreira cookie string za Set-Cookie header
 */
export function createCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...options,
  };

  return serialize(name, value, defaultOptions);
}

/**
 * Kreira session cookie (važi dok se ne zatvori browser)
 */
export function createSessionCookie(name: string, value: string): string {
  return createCookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Kreira persistent cookie (sa maxAge)
 */
export function createPersistentCookie(
  name: string,
  value: string,
  maxAge: number = 7 * 24 * 60 * 60 // 7 dana u sekundama
): string {
  return createCookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  });
}

/**
 * Briše cookie postavljanjem maxAge na 0
 */
export function deleteCookie(name: string): string {
  return createCookie(name, '', { maxAge: 0 });
}

/**
 * Parsira cookies iz request-a
 */
export function parseCookies(request: NextRequest): Record<string, string> {
  const cookieHeader = request.headers.get('cookie') || '';
  return parse(cookieHeader) as Record<string, string>;
}

/**
 * Dobija vrednost specifičnog cookie-a
 */
export function getCookie(request: NextRequest, name: string): string | undefined {
  const cookies = parseCookies(request);
  return cookies[name];
}