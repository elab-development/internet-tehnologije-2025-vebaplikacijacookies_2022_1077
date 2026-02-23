// app/api/wishlist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

/**
 * GET /api/wishlist
 * Vraća listu želja prijavljenog korisnika
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Morate biti prijavljeni' },
                { status: 401 }
            );
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: payload.userId },
            include: {
                product: {
                    include: { category: true },
                },
            },
            orderBy: { addedAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: wishlist,
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/wishlist
 * Dodaje proizvod u listu želja
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

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'productId je obavezan' },
                { status: 400 }
            );
        }

        // Provera da li već postoji
        const existing = await prisma.wishlist.findUnique({
            where: { userId_productId: { userId: payload.userId, productId } },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Proizvod je već na listi želja' },
                { status: 409 }
            );
        }

        const item = await prisma.wishlist.create({
            data: { userId: payload.userId, productId },
        });

        return NextResponse.json({
            success: true,
            message: 'Dodato na listu želja',
            data: item,
        }, { status: 201 });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/wishlist?productId=xxx
 * Uklanja proizvod sa liste želja
 */
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json(
                { success: false, error: 'Morate biti prijavljeni' },
                { status: 401 }
            );
        }

        const productId = request.nextUrl.searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'productId je obavezan' },
                { status: 400 }
            );
        }

        await prisma.wishlist.delete({
            where: { userId_productId: { userId: payload.userId, productId } },
        });

        return NextResponse.json({
            success: true,
            message: 'Uklonjeno sa liste želja',
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
