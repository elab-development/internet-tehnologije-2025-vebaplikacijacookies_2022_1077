// lib/auth/permissions.ts

import { UserRole } from '@prisma/client';

/**
 * Definicija permisija za svaku ulogu
 */
export const PERMISSIONS = {
  GUEST: [
    'products:read',
    'categories:read',
    'cart:manage_own',
  ],
  CUSTOMER: [
    'products:read',
    'categories:read',
    'cart:manage_own',
    'orders:create',
    'orders:read_own',
    'profile:read_own',
    'profile:update_own',
    'reviews:create',
    'reviews:update_own',
    'reviews:delete_own',
  ],
  MODERATOR: [
    'products:read',
    'categories:read',
    'cart:manage_own',
    'orders:create',
    'orders:read_own',
    'profile:read_own',
    'profile:update_own',
    'reviews:create',
    'reviews:update_own',
    'reviews:delete_own',
    'reviews:moderate', // Može moderirati sve recenzije
    'analytics:read_basic',
  ],
  ADMIN: [
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'categories:read',
    'categories:create',
    'categories:update',
    'categories:delete',
    'cart:manage_own',
    'orders:read_all',
    'orders:update',
    'orders:delete',
    'users:read',
    'users:update',
    'users:delete',
    'profile:read_own',
    'profile:update_own',
    'reviews:moderate',
    'analytics:read_all',
    'settings:update',
  ],
  SUPER_ADMIN: [
    '*', // Sve permisije
  ],
} as const;

/**
 * Proverava da li korisnik ima određenu permisiju
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const rolePermissions: readonly string[] = PERMISSIONS[role] || [];

  // Super admin ima sve permisije
  if (rolePermissions.includes('*')) {
    return true;
  }

  return rolePermissions.includes(permission);
}

/**
 * Proverava da li korisnik ima bar jednu od navedenih permisija
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Proverava da li korisnik ima sve navedene permisije
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Vraća sve permisije za određenu ulogu
 */
export function getPermissionsForRole(role: UserRole): readonly string[] {
  return PERMISSIONS[role] || [];
}

/**
 * Proverava da li je korisnik admin (ADMIN ili SUPER_ADMIN)
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * Proverava da li je korisnik moderator ili viši
 */
export function isModerator(role: UserRole): boolean {
  return (
    role === UserRole.MODERATOR ||
    role === UserRole.ADMIN ||
    role === UserRole.SUPER_ADMIN
  );
}

/**
 * Proverava da li je korisnik customer ili viši
 */
export function isCustomer(role: UserRole): boolean {
  return (
    role === UserRole.CUSTOMER ||
    role === UserRole.MODERATOR ||
    role === UserRole.ADMIN ||
    role === UserRole.SUPER_ADMIN
  );
}