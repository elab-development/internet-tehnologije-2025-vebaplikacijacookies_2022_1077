// lib/auth/jwt.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token važi 7 dana
const REMEMBER_TOKEN_EXPIRES_IN = '30d'; // "Remember me" token važi 30 dana

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

/**
 * Kreira JWT token
 * @param payload - Podaci koji se čuvaju u tokenu
 * @param expiresIn - Vreme trajanja tokena
 * @returns JWT token string
 */
export function createToken(
  payload: JWTPayload,
  expiresIn: string = JWT_EXPIRES_IN
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifikuje JWT token
 * @param token - JWT token string
 * @returns Dekodiran payload ili null ako je token nevažeći
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Kreira "Remember Me" token sa dužim trajanjem
 */
export function createRememberToken(payload: JWTPayload): string {
  return createToken(payload, REMEMBER_TOKEN_EXPIRES_IN);
}

/**
 * Dekodira token bez verifikacije (za debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}