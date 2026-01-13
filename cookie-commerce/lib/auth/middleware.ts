// lib/auth/middleware.ts (dodaj na kraj fajla)

import { hasPermission, isAdmin, isModerator, isCustomer } from './permissions';

/**
 * Middleware za proveru specifične permisije
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
 * Wrapper funkcije za lakšu upotrebu
 */
export { isAdmin, isModerator, isCustomer };