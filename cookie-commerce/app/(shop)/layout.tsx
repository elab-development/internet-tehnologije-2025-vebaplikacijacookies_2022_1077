// app/(shop)/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proizvodi | Cookie Commerce',
  description: 'Pregledajte našu ponudu proizvoda',
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}