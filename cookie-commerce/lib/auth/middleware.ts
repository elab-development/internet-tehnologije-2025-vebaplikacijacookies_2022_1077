// lib/auth/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

import { getCookie, COOKIE_NAMES } from './cookies';
import { verifyToken, JWTPayload } from './jwt';
import {
  hasPermission,
  isAdmin as isAdminHelper,
  isModerator as isModeratorHelper,
  isCustomer as isCustomerHelper,
} from './permissions';

/**
 * Prošireni NextRequest sa user objektom (JWT payload)
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware za proveru autentifikacije.
 * Čita JWT iz SESSION_TOKEN cookie-a, verifikuje ga i vraća user payload ili null.
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
 * Middleware za proveru da li korisnik ima neku od dozvoljenih uloga.
 *
 * Primer upotrebe u API ruti:
 * const authError = await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])(request);
 * if (authError) return authError;
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

    return null;
  };
}

/**
 * Helper: zahteva da korisnik bude ADMIN ili SUPER_ADMIN.
 *
 * Upotreba:
 * const authError = await requireAdmin(request);
 * if (authError) return authError;
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  return requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])(request);
}

/**
 * Helper: zahteva da korisnik bude bar CUSTOMER (ili viši: MODERATOR, ADMIN, SUPER_ADMIN).
 *
 * Upotreba:
 * const authError = await requireCustomer(request);
 * if (authError) return authError;
 */
export async function requireCustomer(
  request: NextRequest
): Promise<NextResponse | null> {
  return requireRole([
    UserRole.CUSTOMER,
    UserRole.MODERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ])(request);
}

/**
 * Middleware za proveru specifične permisije.
 *
 * Primer:
 * const authError = await requirePermission('products:create')(request);
 * if (authError) return authError;
 */
export function requirePermission(permission: string) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const { user, error } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role as UserRole, permission)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nemate dozvolu za ovu akciju',
          requiredPermission: permission,
          yourRole: user.role,
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Wrapper funkcije za lakšu proveru uloga bez vraćanja NextResponse.
 * Ovo su samo helpers za ručnu logiku (npr. na klijentu ili u nekim servisima).
 */
export const isAdmin = (role: UserRole) => isAdminHelper(role);
export const isModerator = (role: UserRole) => isModeratorHelper(role);
export const isCustomer = (role: UserRole) => isCustomerHelper(role);