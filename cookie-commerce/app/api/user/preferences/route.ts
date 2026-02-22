import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/middleware';

export async function PUT(request: NextRequest) {
  const { user } = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { theme, language, currency } = body;

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: user.userId },
    update: { theme, language, currency },
    create: {
      userId: user.userId,
      theme,
      language,
      currency,
    },
  });

  return NextResponse.json({ success: true, data: preferences });
}
