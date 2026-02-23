// hooks/useCookieConsent.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CookieConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentState {
  hasConsent: boolean;
  preferences: CookieConsentPreferences;
  consentDate: Date | null;
}

const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_COOKIE_EXPIRY = 365; // dana

/**
 * Custom hook za upravljanje cookie consent-om
 * 
 * @example
 * const { hasConsent, preferences, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent();
 */
export function useCookieConsent() {
  const [consentState, setConsentState] = useState<CookieConsentState>({
    hasConsent: false,
    preferences: {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    },
    consentDate: null,
  });

  const [showBanner, setShowBanner] = useState(false);

  // ==========================================
  // HELPER FUNKCIJE ZA COOKIES
  // ==========================================

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }

    return null;
  }, []);

  const setCookie = useCallback((name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;

    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }, []);

  // ==========================================
  // UČITAVANJE CONSENT-a IZ COOKIE-a
  // ==========================================

  useEffect(() => {
    const loadConsent = () => {
      try {
        const cookieValue = getCookie(CONSENT_COOKIE_NAME);

        if (cookieValue) {
          const parsed = JSON.parse(decodeURIComponent(cookieValue));
          setConsentState({
            hasConsent: true,
            preferences: parsed.preferences,
            consentDate: new Date(parsed.consentDate),
          });
          setShowBanner(false);
        } else {
          // Nema consent-a - prikaži banner
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Failed to load cookie consent:', error);
        setShowBanner(true);
      }
    };

    loadConsent();
  }, [getCookie]);

  // ==========================================
  // ČUVANJE CONSENT-a
  // ==========================================

  const saveConsent = useCallback(
    async (preferences: CookieConsentPreferences) => {
      const consentData = {
        preferences,
        consentDate: new Date().toISOString(),
      };

      // Sačuvaj u cookie
      setCookie(
        CONSENT_COOKIE_NAME,
        encodeURIComponent(JSON.stringify(consentData)),
        CONSENT_COOKIE_EXPIRY
      );

      // Ažuriraj state
      setConsentState({
        hasConsent: true,
        preferences,
        consentDate: new Date(),
      });

      setShowBanner(false);

      // Sačuvaj u bazu ako je korisnik prijavljen
      try {
        await fetch('/api/cookie-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(preferences),
        });
      } catch (error) {
        console.error('Failed to save consent to database:', error);
      }
    },
    []
  );

  // ==========================================
  // ACCEPT ALL
  // ==========================================

  const acceptAll = useCallback(() => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [saveConsent]);

  // ==========================================
  // REJECT ALL (osim essential)
  // ==========================================

  const rejectAll = useCallback(() => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [saveConsent]);

  // ==========================================
  // SAVE CUSTOM PREFERENCES
  // ==========================================

  const savePreferences = useCallback(
    (preferences: Partial<CookieConsentPreferences>) => {
      saveConsent({
        essential: true, // Uvek true
        functional: preferences.functional ?? false,
        analytics: preferences.analytics ?? false,
        marketing: preferences.marketing ?? false,
      });
    },
    [saveConsent]
  );

  // ==========================================
  // OPEN SETTINGS
  // ==========================================

  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  return {
    hasConsent: consentState.hasConsent,
    preferences: consentState.preferences,
    consentDate: consentState.consentDate,
    showBanner,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
  };
}