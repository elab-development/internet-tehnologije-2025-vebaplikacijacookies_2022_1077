// app/api/admin/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

/**
 * GET /api/admin/analytics
 * Napredna analitika za admin (konverzije, napuštanje korpe, saobraćaj)
 */
export async function GET(request: NextRequest) {
    try {
        const authError = await requireAdmin(request);
        if (authError) return authError;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // ==========================================
        // 1. KONVERZIJE
        // ==========================================
        const totalCarts = await prisma.cart.count();
        const completedOrders = await prisma.order.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });
        const totalUsers = await prisma.user.count();
        const usersWithOrders = await prisma.order.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: thirtyDaysAgo } },
        });
        const conversionRate = totalCarts > 0
            ? Math.round((completedOrders / totalCarts) * 100 * 10) / 10
            : 0;

        // ==========================================
        // 2. NAPUŠTANJE KORPE
        // ==========================================
        const activeCarts = await prisma.cart.findMany({
            include: { _count: { select: { items: true } } },
        });
        const cartsWithItems = activeCarts.filter(c => c._count.items > 0).length;
        const abandonedCarts = cartsWithItems; // Korpe sa stavkama koje nisu kupljene

        // ==========================================
        // 3. SAOBRAĆAJ — Analytics events po danima
        // ==========================================
        const events = await prisma.analyticsEvent.findMany({
            where: { timestamp: { gte: sevenDaysAgo } },
            select: { timestamp: true, eventType: true },
        });

        // Grupisanje po danima
        const trafficByDay: Record<string, { pageViews: number; events: number }> = {};
        for (let d = 0; d < 7; d++) {
            const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
            const key = date.toISOString().split('T')[0];
            trafficByDay[key] = { pageViews: 0, events: 0 };
        }

        events.forEach((ev) => {
            const key = ev.timestamp.toISOString().split('T')[0];
            if (trafficByDay[key]) {
                trafficByDay[key].events++;
                if (ev.eventType === 'page_view') {
                    trafficByDay[key].pageViews++;
                }
            }
        });

        const trafficData = Object.entries(trafficByDay)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ==========================================
        // 4. EVENT BREAKDOWN
        // ==========================================
        const eventCounts = await prisma.analyticsEvent.groupBy({
            by: ['eventType'],
            where: { timestamp: { gte: thirtyDaysAgo } },
            _count: { eventType: true },
        });

        const eventBreakdown = eventCounts.map(e => ({
            type: e.eventType,
            count: (e._count as any)?.eventType ?? 0,
        })).sort((a, b) => b.count - a.count);

        // ==========================================
        // 5. PRIHOD PO DANIMA (poslednjih 30 dana)
        // ==========================================
        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
            select: { createdAt: true, totalAmount: true },
        });

        const revenueByDay: Record<string, number> = {};
        recentOrders.forEach(o => {
            const key = o.createdAt.toISOString().split('T')[0];
            revenueByDay[key] = (revenueByDay[key] || 0) + o.totalAmount;
        });

        const revenueData = Object.entries(revenueByDay)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            success: true,
            data: {
                conversion: {
                    rate: conversionRate,
                    totalCarts,
                    completedOrders,
                    totalUsers,
                    usersWithOrders: usersWithOrders.length,
                },
                cartAbandonment: {
                    activeCarts: activeCarts.length,
                    cartsWithItems,
                    abandonedCarts,
                },
                traffic: trafficData,
                eventBreakdown,
                revenue: revenueData,
            },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ success: false, error: 'Greška' }, { status: 500 });
    }
}
