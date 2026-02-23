import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Morate biti prijavljeni da biste izvršili kupovinu' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shippingAddress, paymentMethod } = body;

    // 1. Dohvati korpu korisnika
    const cart = await prisma.cart.findUnique({
      where: { userId: user.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vaša korpa je prazna' },
        { status: 400 }
      );
    }

    // 2. Transakcija: Provera zaliha -> Kreiranje narudžbine -> Umanjenje zaliha -> Brisanje korpe
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      // Provera zaliha i kalkulacija
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Proizvod ${item.product.name} više nije dostupan u traženoj količini.`);
        }
        totalAmount += item.product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: item.product.price,
          productName: item.product.name // Čuvamo ime za istorijske podatke
        });
      }

      // Kreiraj narudžbinu
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'PENDING',
          totalAmount,
          currency: 'RSD',
          shippingStreet: shippingAddress.street,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              transactionId: `TXN-${Date.now()}`,
              paymentMethod,
              amount: totalAmount,
              currency: 'RSD',
              status: 'SUCCESS', // Mock uspeh
              providerResponse: JSON.stringify({ simulated: true }),
            },
          },
        },
      });

      // Umanji zalihe
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Obriši stavke iz korpe
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Narudžbina uspešno kreirana',
      data: order,
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Došlo je do greške pri kreiranju narudžbine' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Morate biti prijavljeni da biste videli narudžbine' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške pri učitavanju narudžbina' },
      { status: 500 }
    );
  }
}
