import { NextRequest, NextResponse } from 'next/server';
import { getCookie, COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getCookie(request, COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      return NextResponse.json({ success: false, expiresIn: 0 });
    }

    const payload = verifyToken(sessionToken);

    if (!payload || !payload.exp) {
      return NextResponse.json({ success: false, expiresIn: 0 });
    }

    // Računamo preostalo vreme u sekundama
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    return NextResponse.json({
      success: true,
      expiresIn: Math.max(0, expiresIn),
    });
  } catch (error) {
    return NextResponse.json({ success: false, expiresIn: 0 });
  }
}
