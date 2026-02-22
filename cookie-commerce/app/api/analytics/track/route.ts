import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, pageUrl, eventData, referrer } = body;
    const { user } = await authenticate(request); // Opciono, analitika može biti i anonimna

    // Proveri da li korisnik ima aktivan pristanak za analitiku (ovo bi trebalo da se radi na klijentu pre slanja, ali i ovde kao backup)
    // Ovde pretpostavljamo da klijent šalje samo ako je dao pristanak.

    // Pronađi ili kreiraj sesiju (ako je anonimna, koristi fingerprint ili cookie ID)
    let sessionId = user?.sessionId;

    if (!sessionId) {
      // Za anonimne korisnike, sessionId bi trebao biti poslat iz cookie-a
      // Ovde pojednostavljujemo: ako nema sessionId, kreiramo dummy sesiju ili preskačemo
      // U realnom sistemu, ovde bismo koristili `analytics_session_id` cookie
      return NextResponse.json({ success: true, message: 'Skipped (no session)' });
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        pageUrl,
        eventData: eventData ? JSON.stringify(eventData) : null,
        referrer: referrer || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Ne vraćamo grešku klijentu da ne blokiramo UI
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
