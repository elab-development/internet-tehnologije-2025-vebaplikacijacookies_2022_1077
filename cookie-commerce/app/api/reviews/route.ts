// app/api/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { logAuditAction } from '@/lib/audit';

/**
 * GET /api/reviews?productId=xxx
 * Vraća odobrene recenzije za proizvod (javno)
 */
export async function GET(request: NextRequest) {
    try {
        const productId = request.nextUrl.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'productId je obavezan' },
                { status: 400 }
            );
        }

        const reviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Prosečna ocena
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                reviews,
                averageRating: Math.round(avgRating * 10) / 10,
                totalCount: reviews.length,
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reviews
 * Kreira novu recenziju (samo za prijavljene korisnike)
 */
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Morate biti prijavljeni' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, rating, comment } = body;

        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: 'productId i rating (1-5) su obavezni' },
                { status: 400 }
            );
        }

        // Provera da li proizvod postoji
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Proizvod nije pronađen' },
                { status: 404 }
            );
        }

        // Provera da li korisnik već ima recenziju za ovaj proizvod
        const existing = await prisma.review.findUnique({
            where: { userId_productId: { userId: payload.userId, productId } },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Već ste ostavili recenziju za ovaj proizvod' },
                { status: 409 }
            );
        }

        const review = await prisma.review.create({
            data: {
                userId: payload.userId,
                productId,
                rating,
                comment: comment || null,
                isApproved: false, // Čeka moderaciju
            },
        });

        await logAuditAction({
            userId: payload.userId,
            action: 'review.create',
            target: review.id,
            details: { productId, rating },
        });

        return NextResponse.json({
            success: true,
            message: 'Recenzija je poslata na moderaciju',
            data: review,
        }, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
