// middleware.ts (u root folderu projekta)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

/**
 * Globalni middleware koji se izvršava pre svih ruta
 * Koristi se za:
 * - Zaštitu admin ruta
 * - Proveru autentifikacije
 * - Automatsko preusmeravanje
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. ZAŠTITA ADMIN RUTA
  // ==========================================

  if (pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    if (!sessionToken) {
      // Nema tokena - preusmeri na login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyToken(sessionToken);

    if (!payload) {
      // Nevažeći token - preusmeri na login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Provera da li korisnik ima admin ulogu
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      // Nema dozvolu - preusmeri na home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin ima pristup - nastavi
    return NextResponse.next();
  }

  // ==========================================
  // 2. ZAŠTITA AUTH STRANICA (login/register)
  // ==========================================

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    if (sessionToken) {
      const payload = verifyToken(sessionToken);

      if (payload) {
        // Korisnik je već prijavljen - preusmeri na home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Nije prijavljen - dozvoli pristup login/register stranicama
    return NextResponse.next();
  }

  // ==========================================
  // 3. ZAŠTITA KORISNIČKIH STRANICA
  // ==========================================

  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyToken(sessionToken);

    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Korisnik je prijavljen - nastavi
    return NextResponse.next();
  }

  // ==========================================
  // 4. DODAVANJE CUSTOM HEADERA (opciono)
  // ==========================================

  const response = NextResponse.next();

  // Dodaj security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Konfiguracija - definiše na kojim rutama se middleware izvršava
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
   runtime: 'nodejs',
};