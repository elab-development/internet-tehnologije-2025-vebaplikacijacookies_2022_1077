// components/cookies/CookieConsentBanner.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCookieConsentContext } from '@/context/CookieConsentContext';

/**
 * Cookie Consent Banner komponenta (GDPR compliant)
 * Prikazuje se pri prvoj poseti ili kada korisnik otvori podešavanja.
 * Zahteva da aplikacija bude wrap-ovana u <CookieConsentProvider>.
 */
export const CookieConsentBanner: React.FC = () => {
  const {
    showBanner,
    preferences,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useCookieConsentContext();

  const [showDetails, setShowDetails] = useState(false);
  const [customPreferences, setCustomPreferences] = useState(preferences);

  // Kada se preferences promene u kontekstu, osveži lokalni state
  useEffect(() => {
    setCustomPreferences(preferences);
  }, [preferences]);

  const handleTogglePreference = (key: keyof typeof customPreferences) => {
    if (key === 'essential') return; // Essential ne može da se isključi
    setCustomPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveCustom = () => {
    savePreferences(customPreferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Kolačići i privatnost
            </h2>
          </div>

          <p className="text-gray-600">
            Koristimo kolačiće da bismo poboljšali vaše iskustvo na našem sajtu.
            Možete izabrati koje vrste kolačića želite da prihvatite.
          </p>
        </div>

        {/* Simple View */}
        {!showDetails && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Prihvatanjem svih kolačića omogućavate nam da personalizujemo
                sadržaj, analiziramo saobraćaj i pružimo vam najbolje moguće
                iskustvo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={acceptAll}
              >
                Prihvati sve kolačiće
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={rejectAll}
              >
                Odbij sve (osim neophodnih)
              </Button>
            </div>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setShowDetails(true)}
            >
              Prilagodi podešavanja
            </Button>
          </div>
        )}

        {/* Detailed View */}
        {showDetails && (
          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Neophodni kolačići
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ovi kolačići su neophodni za funkcionisanje sajta i ne mogu
                    se isključiti. Uključuju autentifikaciju, sigurnost i
                    osnovne funkcionalnosti.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                    Uvek aktivno
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Primeri: session_token, csrf_token, cart_id
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Funkcionalni kolačići
                  </h3>
                  <p className="text-sm text-gray-600">
                    Omogućavaju personalizaciju (jezik, tema, valuta) i
                    pamćenje vaših preferencija.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPreferences.functional}
                      onChange={() => handleTogglePreference('functional')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Primeri: user_preferences, language, theme
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border-b pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Analitički kolačići
                  </h3>
                  <p className="text-sm text-gray-600">
                    Pomažu nam da razumemo kako korisnici koriste sajt, koje
                    stranice posećuju i kako možemo poboljšati iskustvo.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPreferences.analytics}
                      onChange={() => handleTogglePreference('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Primeri: _ga, _gid, analytics_session
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Marketing kolačići
                  </h3>
                  <p className="text-sm text-gray-600">
                    Koriste se za prikazivanje relevantnih reklama i praćenje
                    efikasnosti marketinških kampanja.
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customPreferences.marketing}
                      onChange={() => handleTogglePreference('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Primeri: _fbp, ads_preferences
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSaveCustom}
              >
                Sačuvaj podešavanja
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowDetails(false)}
              >
                Nazad
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Pročitajte našu{' '}
              <a
                href="/cookie-policy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                politiku kolačića
              </a>{' '}
              za više informacija.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};