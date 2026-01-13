// app/api/moderator/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/middleware';
import { UserRole } from '@prisma/client';

/**
 * GET /api/moderator/reviews
 * Vraća sve recenzije za moderaciju (Moderator, Admin, Super Admin)
 */
export async function GET(request: NextRequest) {
  try {
    // ==========================================
    // PROVERA PRISTUPA (Moderator ili viši)
    // ==========================================

    const authError = await requireRole([
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ])(request);

    if (authError) return authError;

    // ==========================================
    // PLACEHOLDER - Ovde bi bila logika za recenzije
    // ==========================================

    // Za sada vraćamo prazan odgovor jer nemamo Review model
    return NextResponse.json({
      success: true,
      message: 'Moderatorska ruta funkcioniše',
      data: {
        reviews: [],
        note: 'Review model će biti implementiran u sledećoj fazi',
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške',
      },
      { status: 500 }
    );
  }
}