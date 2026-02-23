import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

/**
 * Generise ili cita analytics session ID iz cookie-a
 */
function getAnalyticsSessionId(request: NextRequest): string {
  const existing = request.cookies.get('analytics_sid')?.value;
  if (existing) return existing;
  // Generiši novi — koristi crypto API umesto uuid ako nije dostupan
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, pageUrl, eventData, referrer } = body;

    // Pokušaj autentifikaciju (opciono)
    let sessionId: string;
    try {
      const { user } = await authenticate(request);
      sessionId = user?.sessionId || getAnalyticsSessionId(request);
    } catch {
      sessionId = getAnalyticsSessionId(request);
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        pageUrl: pageUrl || '',
        eventData: eventData ? JSON.stringify(eventData) : null,
        referrer: referrer || null,
      },
    });

    // Postavi analytics_sid cookie u odgovor
    const analyticsSid = getAnalyticsSessionId(request);
    const response = NextResponse.json({ success: true });
    if (!request.cookies.get('analytics_sid')) {
      response.cookies.set('analytics_sid', analyticsSid, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 dana
        sameSite: 'lax',
        httpOnly: false,
      });
    }
    return response;
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
