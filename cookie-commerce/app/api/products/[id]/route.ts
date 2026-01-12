// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin, authenticate } from '@/lib/auth/middleware';

/**
 * GET /api/products/[id]
 * Vraća detalje proizvoda i beleži u view history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // ==========================================
    // DOBIJANJE PROIZVODA
    // ==========================================

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proizvod nije pronađen',
        },
        { status: 404 }
      );
    }

    // Gosti ne mogu videti neaktivne proizvode
    if (!product.isActive) {
      const { user } = await authenticate(request);
      
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Proizvod nije dostupan',
          },
          { status: 404 }
        );
      }
    }

    // ==========================================
    // BELEŽENJE U VIEW HISTORY (ako je korisnik prijavljen)
    // ==========================================

    const { user } = await authenticate(request);

    if (user) {
      // Provera da li već postoji zapis za ovaj proizvod danas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingView = await prisma.viewHistory.findFirst({
        where: {
          userId: user.userId,
          productId: id,
          viewedAt: {
            gte: today,
          },
        },
      });

      // Ako ne postoji, kreiraj novi zapis
      if (!existingView) {
        await prisma.viewHistory.create({
          data: {
            userId: user.userId,
            productId: id,
          },
        });
      }
    }

    // ==========================================
    // ODGOVOR
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri učitavanju proizvoda',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Ažurira proizvod (samo Admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ==========================================
    // PROVERA AUTORIZACIJE
    // ==========================================

    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = params;

    // ==========================================
    // PROVERA DA LI PROIZVOD POSTOJI
    // ==========================================

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proizvod nije pronađen',
        },
        { status: 404 }
      );
    }

    // ==========================================
    // VALIDACIJA PODATAKA
    // ==========================================

    const body = await request.json();
    const { name, description, price, currency, stock, categoryId, imageUrl, isActive } = body;

    if (price !== undefined && price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cena ne može biti negativna',
        },
        { status: 400 }
      );
    }

    if (stock !== undefined && stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zaliha ne može biti negativna',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // AŽURIRANJE PROIZVODA
    // ==========================================

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
        ...(stock !== undefined && { stock }),
        ...(categoryId !== undefined && { categoryId }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Proizvod uspešno ažuriran',
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri ažuriranju proizvoda',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Briše proizvod (samo Admin)
 * Soft delete - postavlja isActive na false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ==========================================
    // PROVERA AUTORIZACIJE
    // ==========================================

    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = params;

    // ==========================================
    // PROVERA DA LI PROIZVOD POSTOJI
    // ==========================================

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proizvod nije pronađen',
        },
        { status: 404 }
      );
    }

    // ==========================================
    // PROVERA DA LI POSTOJE AKTIVNE NARUDŽBINE
    // ==========================================

    const hasActiveOrders = product.orderItems.some(
      (item) => item.order.status !== 'DELIVERED' && item.order.status !== 'CANCELLED'
    );

    if (hasActiveOrders) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ne možete obrisati proizvod koji ima aktivne narudžbine',
          suggestion: 'Deaktivirajte proizvod umesto brisanja',
        },
        { status: 409 }
      );
    }

    // ==========================================
    // SOFT DELETE (postavi isActive na false)
    // ==========================================

    const deletedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Proizvod uspešno deaktiviran',
        data: deletedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri brisanju proizvoda',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}