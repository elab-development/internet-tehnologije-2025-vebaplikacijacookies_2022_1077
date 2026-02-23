// app/page.tsx

'use client';

import React, { useState } from 'react';
import { ACTIVE_TESTS } from '@/lib/ab-testing/ab-test';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { RecommendedProducts } from '@/components/products/RecommendedProducts';
import { WeatherWidget } from '@/components/checkout/WeatherWidget';
import { useABTest } from '@/hooks/useABTest';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Učitaj par proizvoda za "Featured" sekciju
  const { products, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 4,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [weatherCity, setWeatherCity] = useState('Beograd');

  // A/B testovi — dodeljuje varijantu i postavlja kolačić pri prvoj poseti
  const { variant: heroCta, forceVariant: forceHeroCta, isReady: heroReady } = useABTest('hero_cta');
  const { variant: productLayout, forceVariant: forceProductLayout, isReady: layoutReady } = useABTest('product_layout');

  const [abPanelOpen, setAbPanelOpen] = useState(false);

  // Helpers za A/B panel
  const allTests = [
    { testId: 'hero_cta', label: 'Hero CTA dugme', variant: heroCta, force: forceHeroCta, ready: heroReady },
    { testId: 'product_layout', label: 'Layout proizvoda', variant: productLayout, force: forceProductLayout, ready: layoutReady },
  ];

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Hero sekcija */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Cookie Commerce
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Jednostavna e-commerce platforma sa korpom, autentifikacijom i naprednim
              upravljanjem kolačićima.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/products')}
              >
                {heroCta === 'variant_a' ? 'Započni kupovinu 🛒' : 'Pregledaj proizvode'}
              </Button>

              {!authLoading && !user && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/register')}
                >
                  Registruj se
                </Button>
              )}
            </div>

            {user && (
              <p className="mt-4 text-sm text-gray-600">
                Prijavljeni ste kao{' '}
                <span className="font-semibold">
                  {user.firstName} {user.lastName} ({user.role})
                </span>
              </p>
            )}
          </div>

          <div>
            <Card variant="elevated" padding="lg">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                  Šta nudi ovaj demo?
                </h2>
              </CardHeader>
              <CardBody className="space-y-3 text-gray-700 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>Registracija, prijava, odjava (JWT + cookies)</li>
                  <li>Lista proizvoda sa pretragom, filtrima i sortiranjem</li>
                  <li>Korpa sa persistent cookies i sinhronizacijom sa bazom</li>
                  <li>Role-based pristup (Guest / Customer / Admin)</li>
                  <li>Cookie consent banner i podešavanja kolačića</li>
                </ul>
              </CardBody>
              <CardFooter className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button variant="primary" size="sm">
                    Idi na proizvode
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline" size="sm">
                    Idi na korpu
                  </Button>
                </Link>
                <Link href="/cookie-policy">
                  <Button variant="ghost" size="sm">
                    Politika kolačića
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Personalizovane preporuke (Samo za ulogovane) */}
      <div className="max-w-7xl mx-auto px-4">
        <RecommendedProducts />
      </div>

      {/* Featured proizvodi */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Istaknuti proizvodi</h2>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Prikaži sve
          </Link>
        </div>

        {/* A/B test: product_layout — grid = kartice, list = horizontalni redovi */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm h-64 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-600">Trenutno nema proizvoda u bazi.</p>
        ) : productLayout === 'list' ? (
          /* ---- VARIJANTA B: List layout ---- */
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="md"
                className="flex flex-row items-center gap-6"
              >
                {/* Placeholder slika/ikona */}
                <div className="shrink-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center text-3xl">
                  🛍️
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('sr-RS', {
                      style: 'currency',
                      currency: product.currency,
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/products/${product.id}`)}>
                    Detalji
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* ---- VARIJANTA A (control): Grid layout ---- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="md"
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                </CardBody>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('sr-RS', {
                      style: 'currency',
                      currency: product.currency,
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/products/${product.id}`)}>
                    Detalji
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Vremenska prognoza */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">☁️ Vremenska prognoza</h2>
              <p className="text-sm text-gray-600 mt-1">Proverite vreme za planiranje dostave</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={weatherCity}
                onChange={(e) => setWeatherCity(e.target.value)}
                placeholder="Unesite grad..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
              />
            </div>
          </div>
          <WeatherWidget city={weatherCity} />
        </div>
      </section>
      {/* =============================================
          FLOATING A/B DEV TOOL — donji desni ugao
      ============================================= */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

        {/* Panel se otvara/zatvara */}
        {abPanelOpen && (
          <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl border border-gray-700 w-80 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">A/B Dev Tools</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{ACTIVE_TESTS.length} aktivna testa</span>
            </div>

            {/* Test rows */}
            <div className="divide-y divide-gray-800">
              {allTests.map(({ testId, label, variant, force, ready }) => {
                const test = ACTIVE_TESTS.find(t => t.id === testId);
                return (
                  <div key={testId} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-emerald-400 border border-gray-700">
                        {ready ? variant : '...'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {test?.variants.map((v) => (
                        <button
                          key={v}
                          onClick={() => force(v)}
                          className={`flex-1 text-xs py-1 px-2 rounded transition-all font-mono ${variant === v
                            ? 'bg-indigo-600 text-white shadow-inner'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Cookie se automatski ažurira • 30 dana
              </p>
            </div>
          </div>
        )}

        {/* Toggle dugme */}
        <button
          onClick={() => setAbPanelOpen(o => !o)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold px-3 py-2 rounded-full shadow-lg border border-gray-700 transition-all"
          title="A/B Dev Tools"
        >
          <span className="text-base">🧪</span>
          <span className="hidden sm:inline">A/B Dev Tools</span>
          <span className={`transition-transform ${abPanelOpen ? 'rotate-180' : ''}`}>▲</span>
        </button>

      </div>
      {/* ============================================= */}

    </div>
  );
}