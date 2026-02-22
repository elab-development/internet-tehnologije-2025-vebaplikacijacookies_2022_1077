import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';
import { deleteCookie, COOKIE_NAMES } from '@/lib/auth/cookies';

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Proveri da li korisnik ima aktivne narudžbine koje nisu isporučene
    const activeOrders = await prisma.order.count({
      where: {
        userId: user.userId,
        status: { in: ['PENDING', 'PROCESSING', 'SHIPPED'] },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ne možete obrisati nalog dok imate aktivne narudžbine. Molimo sačekajte isporuku ili ih otkažite.'
        },
        { status: 400 }
      );
    }

    // Transakcija za brisanje svih povezanih podataka
    // Napomena: Zbog onDelete: Cascade u Prisma shemi, brisanje korisnika će automatski
    // obrisati većinu povezanih tabela (sesije, adrese, preference, itd.)
    // Ali za narudžbine možda želimo da ih sačuvamo anonimizovane ili da ih obrišemo
    // Ovde brišemo sve (Hard Delete)
    await prisma.user.delete({
      where: { id: user.userId },
    });

    // Odjava korisnika (brisanje kolačića)
    const response = NextResponse.json({
      success: true,
      message: 'Vaš nalog je trajno obrisan.',
    });

    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.SESSION_TOKEN));
    response.headers.append('Set-Cookie', deleteCookie(COOKIE_NAMES.REMEMBER_TOKEN));

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: 'Došlo je do greške pri brisanju naloga' },
      { status: 500 }
    );
  }
}
