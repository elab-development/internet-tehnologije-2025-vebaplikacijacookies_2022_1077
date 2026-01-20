// components/cookies/CookieSettingsButton.tsx

'use client';

import React from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

/**
 * Floating button za otvaranje cookie podešavanja
 * Prikazuje se nakon što korisnik da consent
 */
export const CookieSettingsButton: React.FC = () => {
  const { hasConsent, openSettings } = useCookieConsent();

  if (!hasConsent) return null;

  return (
    <button
      onClick={openSettings}
      className="fixed bottom-4 left-4 bg-white border-2 border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 group"
      title="Podešavanja kolačića"
    >
      <svg
        className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
      
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Podešavanja kolačića
      </span>
    </button>
  );
};