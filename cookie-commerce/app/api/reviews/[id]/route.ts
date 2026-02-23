// app/api/reviews/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { logAuditAction } from '@/lib/audit';

/**
 * PUT /api/reviews/:id
 * Ažurira svoju recenziju (samo vlasnik)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Morate biti prijavljeni' },
                { status: 401 }
            );
        }

        const review = await prisma.review.findUnique({ where: { id } });

        if (!review) {
            return NextResponse.json(
                { success: false, error: 'Recenzija nije pronađena' },
                { status: 404 }
            );
        }

        if (review.userId !== payload.userId) {
            return NextResponse.json(
                { success: false, error: 'Nemate dozvolu za izmenu ove recenzije' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { rating, comment } = body;

        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                ...(rating && rating >= 1 && rating <= 5 ? { rating } : {}),
                ...(comment !== undefined ? { comment } : {}),
                isApproved: false, // Ponovo ide na moderaciju nakon izmene
            },
        });

        await logAuditAction({
            userId: payload.userId,
            action: 'review.update',
            target: id,
            details: { rating, comment },
        });

        return NextResponse.json({
            success: true,
            message: 'Recenzija ažurirana i ponovo poslata na moderaciju',
            data: updatedReview,
        });
    } catch (error) {
        console.error('Update review error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/reviews/:id
 * Briše svoju recenziju (samo vlasnik)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Morate biti prijavljeni' },
                { status: 401 }
            );
        }

        const review = await prisma.review.findUnique({ where: { id } });

        if (!review) {
            return NextResponse.json(
                { success: false, error: 'Recenzija nije pronađena' },
                { status: 404 }
            );
        }

        if (review.userId !== payload.userId) {
            return NextResponse.json(
                { success: false, error: 'Nemate dozvolu za brisanje ove recenzije' },
                { status: 403 }
            );
        }

        await prisma.review.delete({ where: { id } });

        await logAuditAction({
            userId: payload.userId,
            action: 'review.delete',
            target: id,
        });

        return NextResponse.json({
            success: true,
            message: 'Recenzija obrisana',
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
