// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { UserRole } from '@prisma/client';

/**
 * POST /api/auth/register
 * Registracija novog korisnika
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    // ==========================================
    // VALIDACIJA ULAZNIH PODATAKA
    // ==========================================

    // Provera obaveznih polja
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sva polja su obavezna',
          fields: { email, firstName, lastName },
        },
        { status: 400 }
      );
    }

    // Validacija email formata
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nevažeći format email adrese',
        },
        { status: 400 }
      );
    }

    // Validacija jačine lozinke
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lozinka ne ispunjava uslove',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // PROVERA DA LI KORISNIK VEĆ POSTOJI
    // ==========================================

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Korisnik sa ovom email adresom već postoji',
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ==========================================
    // KREIRANJE NOVOG KORISNIKA
    // ==========================================

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        role: UserRole.CUSTOMER, // Novi korisnici su uvek CUSTOMER
        preferences: {
          create: {
            theme: 'light',
            language: 'sr',
            currency: 'RSD',
            productsPerPage: 12,
            emailNotifications: true,
            smsNotifications: false,
          },
        },
        cookieConsent: {
          create: {
            essential: true, // Essential cookies su uvek omogućeni
            functional: false,
            analytics: false,
            marketing: false,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // ==========================================
    // KREIRANJE PRAZNE KORPE ZA NOVOG KORISNIKA
    // ==========================================

    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    // ==========================================
    // USPEŠAN ODGOVOR
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message: 'Registracija uspešna! Možete se prijaviti.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri registraciji',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}