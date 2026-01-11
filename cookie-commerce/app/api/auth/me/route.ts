// app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCookie, COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/auth/me
 * Vraća podatke o trenutno prijavljenom korisniku
 */
export async function GET(request: NextRequest) {
  try {
    // ==========================================
    // DOBIJANJE TOKENA
    // ==========================================

    const sessionToken = getCookie(request, COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Niste prijavljeni',
          user: null,
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFIKACIJA TOKENA
    // ==========================================

    const payload = verifyToken(sessionToken);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nevažeći token',
          user: null,
        },
        { status: 401 }
      );
    }

    // ==========================================
    // DOBIJANJE KORISNIKA IZ BAZE
    // ==========================================

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        preferences: true,
        cookieConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Korisnik nije pronađen',
          user: null,
        },
        { status: 404 }
      );
    }

    // ==========================================
    // AŽURIRANJE POSLEDNJE AKTIVNOSTI
    // ==========================================

    if (payload.sessionId) {
      await prisma.session.update({
        where: { id: payload.sessionId },
        data: { lastActivityAt: new Date() },
      });
    }

    // ==========================================
    // USPEŠAN ODGOVOR
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške',
        user: null,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}