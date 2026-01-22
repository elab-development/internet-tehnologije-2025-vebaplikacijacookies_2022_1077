// app/admin/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cookie Commerce',
  description: 'Administratorski panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}