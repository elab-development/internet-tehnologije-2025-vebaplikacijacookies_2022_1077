// app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

/**
 * GET /api/products
 * Vraća listu proizvoda sa paginacijom i filterima
 * Javno dostupno (ne zahteva autentifikaciju)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ==========================================
    // PARSIRANJE QUERY PARAMETARA
    // ==========================================

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const isActive = searchParams.get('isActive');

    // Validacija paginacije
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nevažeći parametri paginacije',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // KREIRANJE WHERE USLOVA
    // ==========================================

    const where: any = {
      AND: [
        {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      ],
    };

    // Filter po search termu (naziv ili opis)
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Filter po kategoriji
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter po aktivnosti (samo za admina)
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      // Gosti vide samo aktivne proizvode
      where.isActive = true;
    }

    // ==========================================
    // SORTIRANJE
    // ==========================================

    const orderBy: any = {};
    
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // ==========================================
    // IZVRŠAVANJE UPITA
    // ==========================================

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // ==========================================
    // KALKULACIJA METAPODATAKA
    // ==========================================

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // ==========================================
    // ODGOVOR
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search,
          categoryId,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);

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
 * POST /api/products
 * Kreira novi proizvod (samo Admin)
 */
export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // PROVERA AUTORIZACIJE
    // ==========================================

    const authError = await requireAdmin(request);
    if (authError) return authError;

    // ==========================================
    // VALIDACIJA PODATAKA
    // ==========================================

    const body = await request.json();
    const { name, description, price, currency, stock, categoryId, imageUrl, isActive } = body;

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Obavezna polja: name, description, price, stock',
        },
        { status: 400 }
      );
    }

    if (price < 0 || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cena i zaliha ne mogu biti negativni',
        },
        { status: 400 }
      );
    }

    // Provera da li kategorija postoji
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Kategorija ne postoji',
          },
          { status: 404 }
        );
      }
    }

    // ==========================================
    // KREIRANJE PROIZVODA
    // ==========================================

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        currency: currency || 'RSD',
        stock,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Proizvod uspešno kreiran',
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri kreiranju proizvoda',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}