import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Prikupljanje SVIH podataka vezanih za korisnika
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        addresses: true,
        preferences: true,
        cart: {
          include: { items: { include: { product: true } } },
        },
        orders: {
          include: {
            items: true,
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        viewHistory: {
          include: { product: { select: { name: true } } },
          orderBy: { viewedAt: 'desc' },
        },
        cookieConsent: true,
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            lastActivityAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Ukloni osetljive podatke pre slanja
    const { passwordHash, ...safeUserData } = userData;

    return NextResponse.json({
      success: true,
      data: safeUserData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške pri izvozu podataka' },
      { status: 500 }
    );
  }
}
