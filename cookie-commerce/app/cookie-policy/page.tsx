// app/cookie-policy/page.tsx

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politika kolačića
        </h1>

        <div className="space-y-6">
          {/* Uvod */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Šta su kolačići?
              </h2>
            </CardHeader>
            <CardBody className="prose prose-gray max-w-none">
              <p>
                Kolačići (cookies) su male tekstualne datoteke koje se čuvaju na vašem uređaju
                kada posetite veb sajt. Oni omogućavaju sajtu da zapamti vaše akcije i
                preferencije tokom vremena.
              </p>
            </CardBody>
          </Card>

          {/* Vrste kolačića */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Koje vrste kolačića koristimo?
              </h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Essential */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. Neophodni kolačići
                </h3>
                <p className="text-gray-600 mb-3">
                  Ovi kolačići su neophodni za funkcionisanje sajta i ne mogu se isključiti.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Naziv</th>
                        <th className="text-left py-2">Svrha</th>
                        <th className="text-left py-2">Trajanje</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-mono text-xs">session_token</td>
                        <td className="py-2">Autentifikacija korisnika</td>
                        <td className="py-2">7-30 dana</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-mono text-xs">csrf_token</td>
                        <td className="py-2">Zaštita od CSRF napada</td>
                        <td className="py-2">Sesija</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">cookie_consent</td>
                        <td className="py-2">Čuvanje pristanka za kolačiće</td>
                        <td className="py-2">365 dana</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2. Funkcionalni kolačići
                </h3>
                <p className="text-gray-600 mb-3">
                  Omogućavaju personalizaciju i pamćenje vaših preferencija.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Naziv</th>
                        <th className="text-left py-2">Svrha</th>
                        <th className="text-left py-2">Trajanje</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-mono text-xs">user_preferences</td>
                        <td className="py-2">Jezik, tema, valuta</td>
                        <td className="py-2">365 dana</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">guest_cart</td>
                        <td className="py-2">Korpa za goste</td>
                        <td className="py-2">30 dana</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  3. Analitički kolačići
                </h3>
                <p className="text-gray-600 mb-3">
                  Pomažu nam da razumemo kako korisnici koriste sajt.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Naziv</th>
                        <th className="text-left py-2">Svrha</th>
                        <th className="text-left py-2">Trajanje</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 font-mono text-xs">analytics_session</td>
                        <td className="py-2">Praćenje sesije korisnika</td>
                        <td className="py-2">30 minuta</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  4. Marketing kolačići
                </h3>
                <p className="text-gray-600 mb-3">
                  Koriste se za prikazivanje relevantnih reklama.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Trenutno ne koristimo marketing kolačiće.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Upravljanje */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Kako upravljati kolačićima?
              </h2>
            </CardHeader>
            <CardBody className="prose prose-gray max-w-none">
              <p>
                Možete kontrolisati i/ili obrisati kolačiće kako želite. Možete obrisati sve
                kolačiće koji su već na vašem računaru i možete podesiti većinu pretraživača
                da spreče njihovo postavljanje.
              </p>
              <p>
                Na našem sajtu možete upravljati kolačićima klikom na dugme za podešavanja
                kolačića u donjem levom uglu.
              </p>
            </CardBody>
          </Card>

          {/* Kontakt */}
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900">
                Kontakt
              </h2>
            </CardHeader>
            <CardBody className="prose prose-gray max-w-none">
              <p>
                Ako imate pitanja o našoj politici kolačića, kontaktirajte nas na:
              </p>
              <p>
                Email: <a href="mailto:privacy@cookiecommerce.com">privacy@cookiecommerce.com</a>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}