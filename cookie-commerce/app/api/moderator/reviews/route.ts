// app/api/moderator/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { isModerator } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';

/**
 * GET /api/moderator/reviews
 * Vraća SVE recenzije za moderaciju (uklj. neodobrene i prijavljene)
 * Pristup: MODERATOR, ADMIN, SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || !isModerator(payload.role as UserRole)) {
      return NextResponse.json(
        { success: false, error: 'Nemate pristup' },
        { status: 403 }
      );
    }

    const status = request.nextUrl.searchParams.get('status'); // 'pending' | 'approved' | 'reported' | 'all'

    let where: any = {};
    switch (status) {
      case 'pending':
        where = { isApproved: false, isReported: false };
        break;
      case 'approved':
        where = { isApproved: true };
        break;
      case 'reported':
        where = { isReported: true };
        break;
      default:
        where = {}; // Sve recenzije
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        product: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const counts = {
      total: await prisma.review.count(),
      pending: await prisma.review.count({ where: { isApproved: false, isReported: false } }),
      approved: await prisma.review.count({ where: { isApproved: true } }),
      reported: await prisma.review.count({ where: { isReported: true } }),
    };

    return NextResponse.json({
      success: true,
      data: { reviews, counts },
    });
  } catch (error) {
    console.error('Moderator get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške' },
      { status: 500 }
    );
  }
}