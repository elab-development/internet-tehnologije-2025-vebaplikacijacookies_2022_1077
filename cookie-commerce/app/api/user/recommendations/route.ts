import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/middleware';
import { getRecommendations } from '@/lib/recommendations/algorithm';

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);

    if (!user) {
      // Za goste vraćamo prazan niz ili generičke preporuke (ovde prazno za sad)
      return NextResponse.json({ success: true, data: [] });
    }

    const recommendations = await getRecommendations(user.userId);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška pri generisanju preporuka' },
      { status: 500 }
    );
  }
}
