import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { checkRateLimit } from '@/lib/security/rate-limit';

// Rute koje zahtevaju autentifikaciju
const protectedRoutes = [
  '/api/user',
  '/api/cart/sync',
  '/api/orders',
  '/profile',
  '/checkout'
];

// Rute koje zahtevaju admin prava
const adminRoutes = [
  '/api/admin',
  '/api/products', // POST, PUT, DELETE
  '/admin'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // ==========================================
  // 1. SECURITY HEADERS (Helmet ekvivalent)
  // ==========================================
  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Clickjacking zaštita
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Content Security Policy (Basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  // ==========================================
  // 2. RATE LIMITING (Samo za API rute)
  // ==========================================
  if (path.startsWith('/api')) {
    // Stroži limit za auth rute (Login/Register)
    const isAuthRoute = path.startsWith('/api/auth');
    const limit = isAuthRoute ? 10 : 100; // 10 zahteva/min za auth, 100 za ostalo

    const rateLimit = checkRateLimit(ip, limit, 60000); // 1 minut prozor

    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Previše zahteva. Pokušajte kasnije.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      );
    }
  }

  // ==========================================
  // 3. CSRF & ORIGIN CHECK (Za mutacije)
  // ==========================================
  if (path.startsWith('/api') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Dozvoli request samo ako Origin odgovara Host-u (ili je null za server-side calls u istom okruženju)
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: 'CSRF Validation Failed' },
        { status: 403 }
      );
    }
  }

  // ==========================================
  // 4. AUTHENTICATION & AUTHORIZATION
  // ==========================================

  // Provera zaštićenih ruta
  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

  // Specijalan slučaj za products API: GET je javan, ostalo je Admin
  const isProductMutation = path.startsWith('/api/products') && request.method !== 'GET';

  if (isProtected || isAdminRoute || isProductMutation) {
    const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      // Ako je API poziv, vrati 401 JSON
      if (path.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      // Ako je stranica, preusmeri na login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Provera Admin prava
    if ((isAdminRoute || isProductMutation) && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      if (path.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
  runtime: 'nodejs',
};
