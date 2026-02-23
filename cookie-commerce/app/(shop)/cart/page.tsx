// app/(shop)/cart/page.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CartItem } from '@/components/cart/CartItem';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const result = await updateQuantity(productId, quantity);
    if (!result.success) {
      alert(result.error || 'Greška pri ažuriranju količine');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const result = await removeItem(productId);
    if (!result.success) {
      alert(result.error || 'Greška pri uklanjanju proizvoda');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Da li ste sigurni da želite da ispraznite korpu?')) {
      return;
    }

    const result = await clearCart();
    if (!result.success) {
      alert(result.error || 'Greška pri čišćenju korpe');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Preusmeri na login sa redirect parametrom
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  // ==========================================
  // FORMATIRANJE
  // ==========================================

  const formatPrice = (price: number, currency: string = 'RSD') => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Učitavanje korpe...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY CART STATE
  // ==========================================

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vaša korpa je prazna
            </h2>
            <p className="text-gray-600 mb-6">
              Dodajte proizvode u korpu da biste nastavili sa kupovinom
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/products')}
            >
              Pregledaj proizvode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CART WITH ITEMS
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Korpa za kupovinu</h1>
              <p className="text-gray-600 mt-2">
                {cart.itemCount} {cart.itemCount === 1 ? 'proizvod' : 'proizvoda'} u korpi
              </p>
            </div>

            {/* Clear Cart Button */}
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                }
              >
                Isprazni korpu
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Source Info */}
            {cart.source === 'cookie' && !user && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Korpa je sačuvana u kolačićima</p>
                    <p className="text-sm mt-1">
                      <Link href="/login" className="underline hover:text-blue-800">
                        Prijavite se
                      </Link>{' '}
                      da biste sinhronizovali korpu sa nalogom
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            {cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="elevated" padding="lg" className="sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Pregled narudžbine
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Međuzbir ({cart.itemCount} proizvoda)</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Dostava</span>
                  <span className="text-green-600">Besplatna</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Ukupno</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                className="mb-4"
              >
                {user ? 'Nastavi sa poručivanjem' : 'Prijavi se i poruči'}
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => router.push('/products')}
              >
                Nastavi sa kupovinom
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Besplatna dostava za sve narudžbine</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>30 dana za povraćaj robe</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sigurno plaćanje</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}