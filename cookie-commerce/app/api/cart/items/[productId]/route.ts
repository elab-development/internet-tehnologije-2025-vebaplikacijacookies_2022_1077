// app/api/cart/items/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import {
  parseCartCookie,
  updateItemQuantityInCartCookie,
  removeItemFromCartCookie,
  createCartCookie,
} from '@/lib/cart/cookie-cart';

/**
 * PUT /api/cart/items/[productId]
 * Ažurira količinu proizvoda u korpi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { quantity } = body;

    // ==========================================
    // VALIDACIJA
    // ==========================================

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Količina mora biti 0 ili veća',
        },
        { status: 400 }
      );
    }

    // Provera da li proizvod postoji
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

    if (quantity > product.stock) {
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
    // PRIJAVLJEN KORISNIK
    // ==========================================

    if (user) {
      const cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
      });

      if (!cart) {
        return NextResponse.json(
          {
            success: false,
            error: 'Korpa nije pronađena',
          },
          { status: 404 }
        );
      }

      const cartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (!cartItem) {
        return NextResponse.json(
          {
            success: false,
            error: 'Proizvod nije u korpi',
          },
          { status: 404 }
        );
      }

      if (quantity === 0) {
        // Ukloni proizvod iz korpe
        await prisma.cartItem.delete({
          where: { id: cartItem.id },
        });

        return NextResponse.json({
          success: true,
          message: 'Proizvod uklonjen iz korpe',
        });
      }

      // Ažuriraj količinu
      const updatedItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
        include: {
          product: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Količina ažurirana',
        data: updatedItem,
      });
    }

    // ==========================================
    // GOST
    // ==========================================

    const cookieHeader = request.headers.get('cookie');
    let cartCookie = parseCartCookie(cookieHeader);

    if (quantity === 0) {
      cartCookie = removeItemFromCartCookie(cartCookie, productId);
    } else {
      cartCookie = updateItemQuantityInCartCookie(cartCookie, productId, quantity);
    }

    const response = NextResponse.json({
      success: true,
      message: quantity === 0 ? 'Proizvod uklonjen iz korpe' : 'Količina ažurirana',
    });

    response.headers.append('Set-Cookie', createCartCookie(cartCookie));

    return response;
  } catch (error) {
    console.error('Update cart item error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri ažuriranju korpe',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[productId]
 * Uklanja proizvod iz korpe
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { user } = await authenticate(request);

    // ==========================================
    // PRIJAVLJEN KORISNIK
    // ==========================================

    if (user) {
      const cart = await prisma.cart.findUnique({
        where: { userId: user.userId },
      });

      if (!cart) {
        return NextResponse.json(
          {
            success: false,
            error: 'Korpa nije pronađena',
          },
          { status: 404 }
        );
      }

      const cartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (!cartItem) {
        return NextResponse.json(
          {
            success: false,
            error: 'Proizvod nije u korpi',
          },
          { status: 404 }
        );
      }

      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Proizvod uklonjen iz korpe',
      });
    }

    // ==========================================
    // GOST
    // ==========================================

    const cookieHeader = request.headers.get('cookie');
    let cartCookie = parseCartCookie(cookieHeader);

    cartCookie = removeItemFromCartCookie(cartCookie, productId);

    const response = NextResponse.json({
      success: true,
      message: 'Proizvod uklonjen iz korpe',
    });

    response.headers.append('Set-Cookie', createCartCookie(cartCookie));

    return response;
  } catch (error) {
    console.error('Remove from cart error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri uklanjanju iz korpe',
      },
      { status: 500 }
    );
  }
}
