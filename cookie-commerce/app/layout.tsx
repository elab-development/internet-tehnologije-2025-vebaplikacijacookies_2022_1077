// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';
import { CookieSettingsButton } from '@/components/cookies/CookieSettingsButton';
import { CookieConsentProvider } from '@/context/CookieConsentContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SessionTimeoutWarning } from '@/components/session/SessionTimeoutWarning';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
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
        <AuthProvider>
          <CartProvider>
            <CookieConsentProvider>
              <Header />
              <Suspense fallback={null}>
                <AnalyticsProvider />
              </Suspense>
              {children}
              <CookieConsentBanner />
              <CookieSettingsButton />
              <SessionTimeoutWarning />
            </CookieConsentProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}