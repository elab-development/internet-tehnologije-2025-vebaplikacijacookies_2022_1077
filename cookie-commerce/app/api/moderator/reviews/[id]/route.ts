// app/api/moderator/reviews/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { isModerator } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';
import { logAuditAction } from '@/lib/audit';

/**
 * PUT /api/moderator/reviews/:id
 * Odobrava, odbija ili blokira recenziju
 * Body: { action: 'approve' | 'reject' | 'report' }
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isModerator(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return NextResponse.json(
                { success: false, error: 'Recenzija nije pronađena' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { action } = body;

        let updateData: any = {};
        let message = '';

        switch (action) {
            case 'approve':
                updateData = { isApproved: true, isReported: false };
                message = 'Recenzija odobrena';
                break;
            case 'reject':
                updateData = { isApproved: false };
                message = 'Recenzija odbijena';
                break;
            case 'report':
                updateData = { isReported: true, isApproved: false };
                message = 'Recenzija označena kao neprikladna';
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Nepoznata akcija. Koristite: approve, reject, report' },
                    { status: 400 }
                );
        }

        const updated = await prisma.review.update({
            where: { id },
            data: updateData,
        });

        await logAuditAction({
            userId: payload.userId,
            action: `review.moderate.${action}`,
            target: id,
            details: { reviewUserId: review.userId, productId: review.productId },
        });

        return NextResponse.json({
            success: true,
            message,
            data: updated,
        });
    } catch (error) {
        console.error('Moderate review error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/moderator/reviews/:id
 * Briše bilo koju recenziju (moderator)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isModerator(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return NextResponse.json(
                { success: false, error: 'Recenzija nije pronađena' },
                { status: 404 }
            );
        }

        await prisma.review.delete({ where: { id } });

        await logAuditAction({
            userId: payload.userId,
            action: 'review.moderate.delete',
            target: id,
            details: { reviewUserId: review.userId, productId: review.productId },
        });

        return NextResponse.json({
            success: true,
            message: 'Recenzija obrisana od strane moderatora',
        });
    } catch (error) {
        console.error('Delete review (mod) error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
