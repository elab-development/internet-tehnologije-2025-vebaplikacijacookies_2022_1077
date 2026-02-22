// app/api/cart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import { parseCartCookie } from '@/lib/cart/cookie-cart';

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Vraća korpu korisnika
 *     description: Za prijavljene korisnike vraća korpu iz baze, za goste iz cookie-a
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Korpa
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    // ==========================================
    // PRIJAVLJEN KORISNIK - korpa iz baze
    // ==========================================

    if (user) {
      const cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
        include: {
          items: {
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
                },
              },
            },
          },
        },
      });

      if (!cart) {
        // Kreiraj praznu korpu ako ne postoji
        const newCart = await prisma.cart.create({
          data: { userId: user.userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            id: newCart.id,
            items: [],
            totalAmount: 0,
            itemCount: 0,
            source: 'database',
          },
        });
      }

      // Kalkulacija totala
      const totalAmount = cart.items.reduce(
        (sum, item) => sum + item.priceAtAdd * item.quantity,
        0
      );

      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      return NextResponse.json({
        success: true,
        data: {
          id: cart.id,
          items: cart.items,
          totalAmount,
          itemCount,
          source: 'database',
        },
      });
    }

    // ==========================================
    // GOST - korpa iz cookie-a
    // ==========================================

    const cookieHeader = request.headers.get('cookie');
    const cartCookie = parseCartCookie(cookieHeader);

    if (cartCookie.items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          itemCount: 0,
          source: 'cookie',
        },
      });
    }

    // Dobavi detalje proizvoda iz baze
    const productIds = cartCookie.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        stock: true,
        imageUrl: true,
        isActive: true,
      },
    });

    // Kombinuj cookie podatke sa podacima iz baze
    const items = cartCookie.items
      .map((cookieItem) => {
        const product = products.find((p) => p.id === cookieItem.productId);
        if (!product) return null;

        return {
          productId: product.id,
          product,
          quantity: cookieItem.quantity,
          priceAtAdd: cookieItem.priceAtAdd,
        };
      })
      .filter((item) => item !== null);

    const totalAmount = items.reduce(
      (sum, item) => sum + (item?.priceAtAdd || 0) * (item?.quantity || 0),
      0
    );

    const itemCount = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        totalAmount,
        itemCount,
        source: 'cookie',
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri učitavanju korpe',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Čisti korpu
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Korpa očišćena
 */
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (user) {
      // Obriši sve stavke iz korpe u bazi
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: user.userId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Korpa uspešno očišćena',
      });
    }

    // Za goste, vrati prazan cookie
    const response = NextResponse.json({
      success: true,
      message: 'Korpa uspešno očišćena',
    });

    const { deleteCartCookie } = await import('@/lib/cart/cookie-cart');
    response.headers.append('Set-Cookie', deleteCartCookie());

    return response;
  } catch (error) {
    console.error('Clear cart error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri čišćenju korpe',
      },
      { status: 500 }
    );
  }
}