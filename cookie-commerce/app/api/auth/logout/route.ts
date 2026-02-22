// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCookie, deleteCookie, COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Odjava korisnika
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Uspešna odjava
 */
export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // DOBIJANJE TOKENA IZ COOKIE-A
    // ==========================================

    const sessionToken = getCookie(request, COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Niste prijavljeni',
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFIKACIJA TOKENA
    // ==========================================

    const payload = verifyToken(sessionToken);

    if (!payload || !payload.sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nevažeći token',
        },
        { status: 401 }
      );
    }

    // ==========================================
    // BRISANJE SESIJE IZ BAZE
    // ==========================================

    await prisma.session.delete({
      where: { id: payload.sessionId },
    });

    // ==========================================
    // BRISANJE COOKIES
    // ==========================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Uspešno ste se odjavili',
      },
      { status: 200 }
    );

    // Brišemo sve auth cookies
    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.SESSION_TOKEN));
    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.REMEMBER_TOKEN));

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Čak i ako dođe do greške, brišemo cookies
    const response = NextResponse.json(
      {
        success: true,
        message: 'Odjavljeni ste',
      },
      { status: 200 }
    );

    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.SESSION_TOKEN));
    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.REMEMBER_TOKEN));

    return response;
  }
}