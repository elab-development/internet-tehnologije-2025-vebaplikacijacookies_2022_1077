import { NextRequest, NextResponse } from 'next/server';
import { getCookie, createSessionCookie, COOKIE_NAMES } from '@/lib/auth/cookies';
import { verifyToken, createToken } from '@/lib/auth/jwt';

// Ova ruta služi samo za testiranje isteka sesije (T-11: SK-16)
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

        // Kreiramo novi token koji ističe za tačno 2 minuta (120s)
        const newTokenPayload = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            sessionId: payload.sessionId,
        };

        const newToken = createToken(newTokenPayload, '120s');

        const response = NextResponse.json({
            success: true,
            message: 'Sesija skraćena na 2 minuta radi testiranja.',
        });

        response.headers.append(
            'Set-Cookie',
            createSessionCookie(COOKIE_NAMES.SESSION_TOKEN, newToken)
        );

        return response;
    } catch (error) {
        console.error('Simulate timeout error:', error);
        return NextResponse.json({ success: false, error: 'Failed to simulate timeout' }, { status: 500 });
    }
}
