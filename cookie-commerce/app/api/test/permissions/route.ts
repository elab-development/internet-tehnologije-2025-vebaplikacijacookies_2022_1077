// app/api/test/permissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { getPermissionsForRole } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';

/**
 * GET /api/test/permissions
 * Testna ruta za proveru permisija trenutnog korisnika
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Niste prijavljeni',
          permissions: [],
        },
        { status: 401 }
      );
    }

    const permissions = getPermissionsForRole(user.role as UserRole);

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      permissions: Array.from(permissions),
    });
  } catch (error) {
    console.error('Get permissions error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške',
      },
      { status: 500 }
    );
  }
}