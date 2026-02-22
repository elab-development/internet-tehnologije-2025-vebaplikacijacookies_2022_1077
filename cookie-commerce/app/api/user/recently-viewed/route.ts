import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      // Za sada ne podržavamo istoriju za goste (moglo bi preko cookies, ali baza je za ulogovane)
      return NextResponse.json({ success: true, data: [] });
    }

    // Dohvati istoriju pregleda, sortirano po vremenu, jedinstveni proizvodi
    const viewHistory = await prisma.viewHistory.findMany({
      where: { userId: user.userId },
      orderBy: { viewedAt: 'desc' },
      distinct: ['productId'], // Osigurava da se proizvod ne ponavlja
      take: 4, // Vrati poslednja 4
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            stock: true,
            imageUrl: true,
            isActive: true,
            category: {
              select: { name: true }
            }
          }
        }
      },
    });

    // Mapiraj u format proizvoda
    const products = viewHistory.map((vh) => vh.product).filter(p => p.isActive);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška pri učitavanju istorije' },
      { status: 500 }
    );
  }
}
