import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function PUT(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phoneNumber } = body;

    // Validacija
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Ime i prezime su obavezni' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil uspešno ažuriran',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške pri ažuriranju profila' },
      { status: 500 }
    );
  }
}
