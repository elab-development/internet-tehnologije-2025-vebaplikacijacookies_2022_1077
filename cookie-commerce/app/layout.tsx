// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';
import { CookieSettingsButton } from '@/components/cookies/CookieSettingsButton';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cookie Commerce - E-commerce platforma',
  description: 'Moderna e-commerce platforma sa naprednim upravljanjem kolačićima',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        <Header />
        {children}
        
        {/* Cookie Consent Components */}
        <CookieConsentBanner />
        <CookieSettingsButton />
      </body>
    </html>
  );
}