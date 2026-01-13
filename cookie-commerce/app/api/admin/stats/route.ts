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
      prisma.session.count({
        where: {
          lastActivityAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        distinct: ['userId'],
      }),

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

    const ordersByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

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
        ordersByDay: ordersByDay.map((day) => ({
          date: day.createdAt,
          count: day._count.id,
          revenue: day._sum.totalAmount || 0,
        })),
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