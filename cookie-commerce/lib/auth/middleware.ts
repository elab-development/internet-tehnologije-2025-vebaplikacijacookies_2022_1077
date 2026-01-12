// lib/auth/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCookie, COOKIE_NAMES } from './cookies';
import { verifyToken, JWTPayload } from './jwt';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware za proveru autentifikacije
 * Vraća korisnika ili null ako nije autentifikovan
 */
export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error?: string }> {
  const sessionToken = getCookie(request, COOKIE_NAMES.SESSION_TOKEN);

  if (!sessionToken) {
    return { user: null, error: 'Niste prijavljeni' };
  }

  const payload = verifyToken(sessionToken);

  if (!payload) {
    return { user: null, error: 'Nevažeći token' };
  }

  return { user: payload };
}

/**
 * Middleware za proveru da li korisnik ima određenu ulogu
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const { user, error } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nemate dozvolu za ovu akciju',
          requiredRole: allowedRoles,
          yourRole: user.role,
        },
        { status: 403 }
      );
    }

    return null; // Nema greške, nastavi sa izvršavanjem
  };
}

/**
 * Helper funkcija za proveru da li je korisnik Admin
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])(request);
}

/**
 * Helper funkcija za proveru da li je korisnik Customer ili viši
 */
export async function requireCustomer(request: NextRequest): Promise<NextResponse | null> {
  return requireRole([UserRole.CUSTOMER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN])(
    request
  );
}