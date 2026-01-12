// app/api/cart/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import { parseCartCookie, deleteCartCookie } from '@/lib/cart/cookie-cart';

/**
 * POST /api/cart/sync
 * Sinhronizuje guest korpu (iz cookie-a) sa user korpom (u bazi)
 * Poziva se nakon prijave korisnika
 */
export async function POST(request: NextRequest) {
  try {
    // ==========================================
    // PROVERA AUTENTIFIKACIJE
    // ==========================================

    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Morate biti prijavljeni',
        },
        { status: 401 }
      );
    }

    // ==========================================
    // PARSIRANJE GUEST KORPE IZ COOKIE-A
    // ==========================================

    const cookieHeader = request.headers.get('cookie');
    const guestCart = parseCartCookie(cookieHeader);

    if (guestCart.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nema stavki za sinhronizaciju',
        syncedItems: 0,
      });
    }

    // ==========================================
    // PRONALAŽENJE ILI KREIRANJE USER KORPE
    // ==========================================

    let userCart = await prisma.cart.findUnique({
      where: { userId: user.userId },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId: user.userId },
        include: { items: true },
      });
    }

    // ==========================================
    // SINHRONIZACIJA STAVKI
    // ==========================================

    let syncedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const guestItem of guestCart.items) {
      try {
        // Proveri da li proizvod postoji i da li je dostupan
        const product = await prisma.product.findUnique({
          where: { id: guestItem.productId },
        });

        if (!product || !product.isActive) {
          errors.push(`Proizvod ${guestItem.productId} nije dostupan`);
          skippedCount++;
          continue;
        }

        // Proveri da li proizvod već postoji u user korpi
        const existingItem = userCart.items.find(
          (item) => item.productId === guestItem.productId
        );

        if (existingItem) {
          // Spoji količine
          const newQuantity = existingItem.quantity + guestItem.quantity;

          if (newQuantity > product.stock) {
            errors.push(
              `Nedovoljno zaliha za ${product.name} (dostupno: ${product.stock})`
            );
            skippedCount++;
            continue;
          }

          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
          });

          syncedCount++;
        } else {
          // Dodaj novi proizvod
          if (guestItem.quantity > product.stock) {
            errors.push(
              `Nedovoljno zaliha za ${product.name} (dostupno: ${product.stock})`
            );
            skippedCount++;
            continue;
          }

          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              priceAtAdd: guestItem.priceAtAdd,
            },
          });

          syncedCount++;
        }
      } catch (error) {
        console.error(`Failed to sync item ${guestItem.productId}:`, error);
        errors.push(`Greška pri sinhronizaciji proizvoda ${guestItem.productId}`);
        skippedCount++;
      }
    }

    // ==========================================
    // BRISANJE GUEST KORPE IZ COOKIE-A
    // ==========================================

    const response = NextResponse.json({
      success: true,
      message: 'Sinhronizacija završena',
      syncedItems: syncedCount,
      skippedItems: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });

    response.headers.append('Set-Cookie', deleteCartCookie());

    return response;
  } catch (error) {
    console.error('Cart sync error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Došlo je do greške pri sinhronizaciji korpe',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}