import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCookie, createSessionCookie, COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyToken, createToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getCookie(request, COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'No active session' }, { status: 401 });
    }

    const payload = verifyToken(sessionToken);

    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Kreiramo novi token sa produženim rokom (npr. +1 sat)
    const newTokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      // exp se automatski postavlja u createToken
    };

    const newToken = createToken(newTokenPayload);

    // Ažuriramo sesiju u bazi (opciono, ako koristimo expiresAt u bazi)
    if (payload.sessionId) {
      await prisma.session.update({
        where: { id: payload.sessionId },
        data: {
          lastActivityAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // +1h
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesija produžena',
    });

    response.headers.append(
      'Set-Cookie',
      createSessionCookie(COOKIE_NAMES.SESSION_TOKEN, newToken)
    );

    return response;
  } catch (error) {
    console.error('Extend session error:', error);
    return NextResponse.json({ success: false, error: 'Failed to extend session' }, { status: 500 });
  }
}
