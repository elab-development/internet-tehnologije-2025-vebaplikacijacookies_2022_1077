// app/api/cookie-consent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

/**
 * POST /api/cookie-consent
 * Čuva cookie consent u bazi (samo za prijavljene korisnike)
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    // Ako korisnik nije prijavljen, samo vrati success
    // (consent je već sačuvan u cookie-u)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Consent sačuvan u kolačićima',
      });
    }

    const body = await request.json();
    const { essential, functional, analytics, marketing } = body;

    // ==========================================
    // SAČUVAJ U BAZI
    // ==========================================

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    await prisma.cookieConsent.upsert({
      where: { userId: user.userId },
      update: {
        essential: essential ?? true,
        functional: functional ?? false,
        analytics: analytics ?? false,
        marketing: marketing ?? false,
        lastUpdated: new Date(),
        ipAddress,
      },
      create: {
        userId: user.userId,
        essential: essential ?? true,
        functional: functional ?? false,
        analytics: analytics ?? false,
        marketing: marketing ?? false,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Consent uspešno sačuvan',
    });
  } catch (error) {
    console.error('Save cookie consent error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri čuvanju consent-a',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cookie-consent
 * Vraća cookie consent iz baze (samo za prijavljene korisnike)
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Niste prijavljeni',
        },
        { status: 401 }
      );
    }

    const consent = await prisma.cookieConsent.findUnique({
      where: { userId: user.userId },
    });

    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Consent nije pronađen',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        essential: consent.essential,
        functional: consent.functional,
        analytics: consent.analytics,
        marketing: consent.marketing,
        consentDate: consent.consentDate,
        lastUpdated: consent.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Get cookie consent error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške',
      },
      { status: 500 }
    );
  }
}