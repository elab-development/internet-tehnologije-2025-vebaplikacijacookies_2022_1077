// app/api/user/change-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

/**
 * PUT /api/user/change-password
 * Menja lozinku prijavljenog korisnika
 */
export async function PUT(request: NextRequest) {
    try {
        const { user } = await authenticate(request);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'Sva polja su obavezna' },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'Nova lozinka i potvrda se ne poklapaju' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Nova lozinka mora imati najmanje 8 karaktera' },
                { status: 400 }
            );
        }

        // Dohvati korisnika sa hashovanom lozinkom
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { passwordHash: true },
        });

        if (!dbUser) {
            return NextResponse.json({ success: false, error: 'Korisnik nije pronađen' }, { status: 404 });
        }

        // Proveri trenutnu lozinku
        const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Trenutna lozinka nije ispravna' },
                { status: 400 }
            );
        }

        // Hashuj novu lozinku i sačuvaj
        const newHash = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.userId },
            data: { passwordHash: newHash },
        });

        return NextResponse.json({
            success: true,
            message: 'Lozinka uspešno promenjena',
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
