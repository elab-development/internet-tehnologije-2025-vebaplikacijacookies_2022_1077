// app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { isAdmin } from '@/lib/auth/permissions';
import { UserRole } from '@prisma/client';
import { logAuditAction } from '@/lib/audit';

/**
 * GET /api/admin/orders
 * Lista svih narudžbina (Admin+)
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isAdmin(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const status = request.nextUrl.searchParams.get('status');

        const where: any = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true },
                },
                items: {
                    include: {
                        product: { select: { id: true, name: true, imageUrl: true } },
                    },
                },
                payment: {
                    select: { paymentMethod: true, status: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Statistika statusa
        const statusCounts = {
            total: await prisma.order.count(),
            PENDING: await prisma.order.count({ where: { status: 'PENDING' } }),
            PAID: await prisma.order.count({ where: { status: 'PAID' } }),
            PROCESSING: await prisma.order.count({ where: { status: 'PROCESSING' } }),
            SHIPPED: await prisma.order.count({ where: { status: 'SHIPPED' } }),
            DELIVERED: await prisma.order.count({ where: { status: 'DELIVERED' } }),
            CANCELLED: await prisma.order.count({ where: { status: 'CANCELLED' } }),
        };

        return NextResponse.json({
            success: true,
            data: { orders, statusCounts },
        });
    } catch (error) {
        console.error('Admin get orders error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/orders
 * Menja status narudžbine (Admin+)
 * Body: { orderId, status }
 */
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || !isAdmin(payload.role as UserRole)) {
            return NextResponse.json(
                { success: false, error: 'Nemate pristup' },
                { status: 403 }
            );
        }

        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json(
                { success: false, error: 'orderId i status su obavezni' },
                { status: 400 }
            );
        }

        const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Status mora biti jedan od: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Narudžbina nije pronađena' },
                { status: 404 }
            );
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
            },
        });

        await logAuditAction({
            userId: payload.userId,
            action: 'order.status.change',
            target: orderId,
            details: { previousStatus: order.status, newStatus: status, orderNumber: order.orderNumber },
        });

        return NextResponse.json({
            success: true,
            message: `Status narudžbine promenjen u ${status}`,
            data: updatedOrder,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { success: false, error: 'Došlo je do greške' },
            { status: 500 }
        );
    }
}
