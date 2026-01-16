// app/components-demo/page.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { ProductCard } from '@/components/products/ProductCard';

export default function ComponentsDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleEmailValidation = (value: string) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailError('Nevažeći format email adrese');
    } else {
      setEmailError('');
    }
  };

  const demoProduct = {
    id: '1',
    name: 'Dell XPS 15',
    description: 'Profesionalni laptop sa 15.6" ekranom, Intel i7, 16GB RAM',
    price: 149999,
    currency: 'RSD',
    imageUrl: '/images/dell-xps-15.jpg',
    stock: 3,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reusable Komponente Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testiranje Button, Input i Card komponenti
          </p>
        </div>

        {/* Button Demo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            1. Button Komponenta
          </h2>

          <Card variant="bordered" padding="lg">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Varijante:</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Veličine:</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sa ikonicama:</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Dodaj
                  </Button>
                  <Button
                    variant="outline"
                    rightIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  >
                    Nastavi
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Loading stanje:</h3>
                <div className="flex flex-wrap gap-3">
                  <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                    {isLoading ? 'Učitavanje...' : 'Klikni za loading'}
                  </Button>
                  <Button variant="outline" isLoading>
                    Loading...
                  </Button>
                </div>
              </div>

              {/* Disabled */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Disabled:</h3>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Disabled Primary</Button>
                  <Button variant="outline" disabled>
                    Disabled Outline
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Input Demo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            2. Input Komponenta
          </h2>

          <Card variant="bordered" padding="lg">
            <div className="space-y-6 max-w-md">
              {/* Basic Input */}
              <Input
                label="Osnovno polje"
                placeholder="Unesite tekst..."
                helperText="Ovo je helper tekst"
              />

              {/* Email with Validation */}
              <Input
                label="Email adresa"
                type="email"
                placeholder="primer@email.com"
                value={email}
                onChange={(e) => handleEmailValidation(e.target.value)}
                error={emailError}
                required
              />

              {/* With Icons */}
              <Input
                label="Pretraga"
                placeholder="Pretraži proizvode..."
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              {/* Password */}
              <Input
                label="Lozinka"
                type="password"
                placeholder="••••••••"
                required
              />

              {/* Disabled */}
              <Input
                label="Disabled polje"
                placeholder="Ne možete unositi"
                disabled
                value="Disabled vrednost"
              />
            </div>
          </Card>
        </section>

        {/* Card Demo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            3. Card Komponenta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <h3 className="text-lg font-semibold">Default Card</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600">
                  Ovo je osnovna kartica bez bordera i senke.
                </p>
              </CardBody>
            </Card>

            {/* Bordered Card */}
            <Card variant="bordered">
              <CardHeader>
                <h3 className="text-lg font-semibold">Bordered Card</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600">
                  Kartica sa borderom.
                </p>
              </CardBody>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" clickable>
              <CardHeader>
                <h3 className="text-lg font-semibold">Elevated Card</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600">
                  Kartica sa senkom i hover efektom.
                </p>
              </CardBody>
              <CardFooter>
                <Button size="sm" fullWidth>
                  Akcija
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ProductCard Demo */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            4. ProductCard Komponenta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProductCard
              product={demoProduct}
              onAddToCart={(id) => alert(`Dodato u korpu: ${id}`)}
              onViewDetails={(id) => alert(`Pregled detalja: ${id}`)}
            />

            <ProductCard
              product={{ ...demoProduct, stock: 0 }}
              onAddToCart={(id) => alert(`Dodato u korpu: ${id}`)}
              onViewDetails={(id) => alert(`Pregled detalja: ${id}`)}
            />

            <ProductCard
              product={{ ...demoProduct, imageUrl: null }}
              onAddToCart={(id) => alert(`Dodato u korpu: ${id}`)}
              onViewDetails={(id) => alert(`Pregled detalja: ${id}`)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}