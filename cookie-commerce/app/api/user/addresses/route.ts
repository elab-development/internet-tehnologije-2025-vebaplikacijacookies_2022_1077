import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

// GET - Vraća sve adrese korisnika
export async function GET(request: NextRequest) {
  const { user } = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: user.userId },
    orderBy: { isDefault: 'desc' }, // Default prva
  });

  return NextResponse.json({ success: true, data: addresses });
}

// POST - Dodaje novu adresu
export async function POST(request: NextRequest) {
  const { user } = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { type, street, city, postalCode, country, isDefault } = body;

  // Ako je nova adresa default, ostalima skini default flag
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.userId },
      data: { isDefault: false },
    });
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: user.userId,
      type,
      street,
      city,
      postalCode,
      country,
      isDefault,
    },
  });

  return NextResponse.json({ success: true, data: newAddress });
}
