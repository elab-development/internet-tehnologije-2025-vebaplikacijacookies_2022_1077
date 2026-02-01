// context/CookieConsentContext.tsx

'use client';

import React, { createContext, useContext } from 'react';
import {
  useCookieConsent,
  CookieConsentPreferences,
} from '@/hooks/useCookieConsent';

interface CookieConsentContextValue {
  hasConsent: boolean;
  preferences: CookieConsentPreferences;
  consentDate: Date | null;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: Partial<CookieConsentPreferences>) => void;
  openSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const consent = useCookieConsent();

  return (
    <CookieConsentContext.Provider value={consent}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export function useCookieConsentContext() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      'useCookieConsentContext must be used within <CookieConsentProvider>'
    );
  }
  return ctx;
}