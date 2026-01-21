// app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import {
  validatePrice,
  validateStock,
  validatePagination,
  validateSort,
  sanitizeString,
} from '@/lib/utils/validation';

/**
 * GET /api/products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const isActive = searchParams.get('isActive');

    // ==========================================
    // VALIDACIJA PAGINATION
    // ==========================================

    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: paginationValidation.error,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDACIJA SORT
    // ==========================================

    const allowedSortFields = ['createdAt', 'price', 'name'];
    if (!validateSort(sortBy, allowedSortFields)) {
      return NextResponse.json(
        {
          success: false,
          error: `sortBy mora biti jedan od: ${allowedSortFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        {
          success: false,
          error: 'sortOrder mora biti "asc" ili "desc"',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDACIJA CENA
    // ==========================================

    if (!validatePrice(minPrice) || !validatePrice(maxPrice)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nevažeći cenovni opseg',
        },
        { status: 400 }
      );
    }

    if (minPrice > maxPrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'minPrice ne može biti veći od maxPrice',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // WHERE USLOVI
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

    if (search) {
      const sanitizedSearch = sanitizeString(search);
      where.AND.push({
        OR: [
          { name: { contains: sanitizedSearch, mode: 'insensitive' } },
          { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        ],
      });
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
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

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

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
 */
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, description, price, currency, stock, categoryId, imageUrl, isActive } = body;

    // ==========================================
    // VALIDACIJA
    // ==========================================

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Obavezna polja: name, description, price, stock',
        },
        { status: 400 }
      );
    }

    // Validacija cene
    if (!validatePrice(price)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cena mora biti pozitivan broj',
        },
        { status: 400 }
      );
    }

    // Validacija stock-a
    if (!validateStock(stock)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zaliha mora biti nenegativan ceo broj',
        },
        { status: 400 }
      );
    }

    // Sanitizacija stringova
    const sanitizedName = sanitizeString(name);
    const sanitizedDescription = sanitizeString(description);

    if (sanitizedName.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Naziv mora imati najmanje 3 karaktera',
        },
        { status: 400 }
      );
    }

    if (sanitizedDescription.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Opis mora imati najmanje 10 karaktera',
        },
        { status: 400 }
      );
    }

    // Provera kategorije
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
        name: sanitizedName,
        description: sanitizedDescription,
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