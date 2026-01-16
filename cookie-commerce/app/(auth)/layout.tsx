// app/(auth)/layout.tsx

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autentifikacija | Cookie Commerce',
  description: 'Prijavite se ili registrujte na Cookie Commerce platformi',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}