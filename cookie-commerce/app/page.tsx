// app/page.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';

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
              upravljanjem kolačićima – upravo ono što nam treba za MVP.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/products')}
              >
                Pregledaj proizvode
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

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm h-64 animate-pulse"
              >
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="md"
                className="flex flex-col justify-between"
              >
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {product.description}
                  </p>
                </CardBody>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('sr-RS', {
                      style: 'currency',
                      currency: product.currency,
                      minimumFractionDigits: 0,
                    }).format(product.price)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    Detalji
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}