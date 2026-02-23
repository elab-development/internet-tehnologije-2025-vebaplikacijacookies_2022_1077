import { prisma } from '@/lib/db/prisma';

export async function getRecommendations(userId: string, limit: number = 4) {
  // 1. Dohvati poslednjih 20 pregledanih proizvoda
  const viewHistory = await prisma.viewHistory.findMany({
    where: { userId },
    orderBy: { viewedAt: 'desc' },
    take: 20,
    include: {
      product: {
        select: { categoryId: true, id: true },
      },
    },
  });

  // Ako nema istorije, ne prikazuj preporuke
  if (viewHistory.length === 0) {
    return [];
  }

  // 2. Izdvoj kategorije koje korisnika zanimaju
  const interestedCategoryIds = [...new Set(viewHistory.map((vh) => vh.product.categoryId))];

  // 3. Izdvoj ID-eve proizvoda koje je već video (da ih ne preporučujemo ponovo, opciono)
  const seenProductIds = viewHistory.map((vh) => vh.product.id);

  // 4. Pronađi proizvode iz tih kategorija koje NIJE video
  let recommendations = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: { in: interestedCategoryIds },
      id: { notIn: seenProductIds },
    },
    take: limit,
    orderBy: {
      // Nasumično sortiranje nije lako u Prisma-i, koristićemo createdAt ili stock
      createdAt: 'desc',
    },
    include: { category: true },
  });

  // 5. Ako nema dovoljno preporuka (npr. video je sve iz kategorije), dopuni najnovijim
  if (recommendations.length < limit) {
    const additional = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...seenProductIds, ...recommendations.map((p) => p.id)] },
      },
      take: limit - recommendations.length,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    recommendations = [...recommendations, ...additional];
  }

  return recommendations;
}
