// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createToken, createRememberToken } from '@/lib/auth/jwt';
import {
  createSessionCookie,
  createPersistentCookie,
  COOKIE_NAMES,
} from '@/lib/auth/cookies';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika
 *     description: Prijavljuje korisnika i vraća session token u HttpOnly cookie-u
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               rememberMe:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Uspešna prijava
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Prijava uspešna
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Pogrešan email ili lozinka
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // ==========================================
    // VALIDACIJA
    // ==========================================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email i lozinka su obavezni',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // PRONALAŽENJE KORISNIKA
    // ==========================================

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        preferences: true,
        cookieConsent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pogrešan email ili lozinka',
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFIKACIJA LOZINKE
    // ==========================================

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pogrešan email ili lozinka',
        },
        { status: 401 }
      );
    }

    // ==========================================
    // KREIRANJE SESIJE
    // ==========================================

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + (rememberMe ? 30 : 7));

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: `session_${user.id}_${Date.now()}_${Math.random()}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        expiresAt: sessionExpiresAt,
      },
    });

    // ==========================================
    // KREIRANJE JWT TOKENA
    // ==========================================

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    };

    const accessToken = createToken(tokenPayload);
    const rememberToken = rememberMe ? createRememberToken(tokenPayload) : null;

    // ==========================================
    // POSTAVLJANJE COOKIES
    // ==========================================

    const response = NextResponse.json(
      {
        success: true,
        message: 'Prijava uspešna',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          preferences: user.preferences,
        },
      },
      { status: 200 }
    );

    // Session cookie (važi dok se ne zatvori browser ili 7 dana)
    if (rememberMe && rememberToken) {
      // Persistent cookie za "Remember Me"
      response.headers.append(
        'Set-Cookie',
        createPersistentCookie(COOKIE_NAMES.SESSION_TOKEN, accessToken, 30 * 24 * 60 * 60)
      );
      response.headers.append(
        'Set-Cookie',
        createPersistentCookie(COOKIE_NAMES.REMEMBER_TOKEN, rememberToken, 30 * 24 * 60 * 60)
      );
    } else {
      // Obični session cookie
      response.headers.append(
        'Set-Cookie',
        createSessionCookie(COOKIE_NAMES.SESSION_TOKEN, accessToken)
      );
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri prijavi',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}