// app/api/cart/items/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import {
  parseCartCookie,
  addItemToCartCookie,
  createCartCookie,
} from '@/lib/cart/cookie-cart';

/**
 * POST /api/cart/items
 * Dodaje proizvod u korpu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // ==========================================
    // VALIDACIJA
    // ==========================================

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'productId je obavezan',
        },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Količina mora biti najmanje 1',
        },
        { status: 400 }
      );
    }

    // ==========================================
    // PROVERA DA LI PROIZVOD POSTOJI
    // ==========================================

    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    if (!product.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proizvod nije dostupan',
        },
        { status: 400 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nema dovoljno proizvoda na stanju',
          available: product.stock,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    const { user } = await authenticate(request);

    // ==========================================
    // PRIJAVLJEN KORISNIK - dodaj u bazu
    // ==========================================

    if (user) {
      // Pronađi ili kreiraj korpu
      let cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: user.userId },
        });
      }

      // Proveri da li proizvod već postoji u korpi
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (existingItem) {
        // Ažuriraj količinu
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          return NextResponse.json(
            {
              success: false,
              error: 'Nema dovoljno proizvoda na stanju',
              available: product.stock,
              inCart: existingItem.quantity,
              requested: quantity,
            },
            { status: 400 }
          );
        }

        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            product: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Količina proizvoda ažurirana',
          data: updatedItem,
        });
      }

      // Kreiraj novu stavku
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: product.price,
        },
        include: {
          product: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Proizvod dodat u korpu',
          data: cartItem,
        },
        { status: 201 }
      );
    }

    // ==========================================
    // GOST - dodaj u cookie
    // ==========================================

    const cookieHeader = request.headers.get('cookie');
    let cartCookie = parseCartCookie(cookieHeader);

    // Proveri ukupnu količinu u korpi
    const existingItem = cartCookie.items.find((item) => item.productId === productId);
    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    if (totalQuantity > product.stock) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nema dovoljno proizvoda na stanju',
          available: product.stock,
          inCart: existingItem?.quantity || 0,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    cartCookie = addItemToCartCookie(cartCookie, productId, quantity, product.price);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Proizvod dodat u korpu',
        data: {
          productId,
          quantity: totalQuantity,
          priceAtAdd: product.price,
        },
      },
      { status: 201 }
    );

    response.headers.append('Set-Cookie', createCartCookie(cartCookie));

    return response;
  } catch (error) {
    console.error('Add to cart error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri dodavanju u korpu',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}