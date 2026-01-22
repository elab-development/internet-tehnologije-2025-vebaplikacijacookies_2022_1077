// app/api/admin/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

/**
 * GET /api/admin/stats
 * Vraća statistiku sistema (samo za admina)
 */
export async function GET(request: NextRequest) {
  try {
    // ==========================================
    // PROVERA ADMIN PRISTUPA
    // ==========================================

    const authError = await requireAdmin(request);
    if (authError) return authError;

    // ==========================================
    // PRIKUPLJANJE STATISTIKE
    // ==========================================

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeUsers,
      pendingOrders,
    ] = await Promise.all([
      // Ukupan broj korisnika
      prisma.user.count(),

      // Ukupan broj proizvoda
      prisma.product.count(),

      // Ukupan broj narudžbina
      prisma.order.count(),

      // Ukupan prihod (samo uspešne narudžbine)
      prisma.order.aggregate({
        where: {
          status: {
            in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Aktivni korisnici (prijavljeni u poslednjih 7 dana)
      prisma.session.groupBy({
        by: ['userId'],
        where: {
          lastActivityAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          userId: true,
        },
      }).then((result) => result.length),

      // Narudžbine na čekanju
      prisma.order.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    // ==========================================
    // TOP 5 PROIZVODA
    // ==========================================

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Dobavi detalje proizvoda
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        });

        return {
          product,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.productId,
        };
      })
    );

    // ==========================================
    // STATISTIKA PO DANIMA (poslednjih 7 dana)
    // ==========================================

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    // Grupisanje po danima
    const ordersByDayMap = new Map<string, { count: number; revenue: number }>();

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = ordersByDayMap.get(dateKey) || { count: 0, revenue: 0 };
      ordersByDayMap.set(dateKey, {
        count: existing.count + 1,
        revenue: existing.revenue + order.totalAmount,
      });
    });

    const ordersByDay = Array.from(ordersByDayMap.entries())
      .map(([date, data]) => ({
        date: new Date(date),
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    // ==========================================
    // ODGOVOR
    // ==========================================

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          activeUsers,
          pendingOrders,
        },
        topProducts: topProductsWithDetails,
        ordersByDay,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri učitavanju statistike',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}