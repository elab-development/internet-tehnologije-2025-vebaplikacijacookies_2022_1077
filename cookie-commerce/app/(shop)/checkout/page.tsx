'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const STEPS = ['Dostava', 'Plaćanje', 'Potvrda'];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const { user, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [shippingData, setShippingData] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'Srbija'
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!shippingData.street || !shippingData.city || !shippingData.postalCode) {
        alert('Molimo popunite sva polja za dostavu.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitOrder = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingData,
          paymentMethod
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Očisti korpu lokalno (iako server to radi, dobro je za UI)
        window.location.href = '/checkout/success';
      } else {
        alert(data.error || 'Greška pri kreiranju narudžbine');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo je do greške.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || cartLoading) return <div className="p-8 text-center">Učitavanje...</div>;
  if (!cart || cart.items.length === 0) return <div className="p-8 text-center">Vaša korpa je prazna.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg">

              {/* STEP 1: SHIPPING */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Podaci za dostavu</h2>
                  <Input
                    label="Ulica i broj"
                    value={shippingData.street}
                    onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
                    placeholder="Bulevar kralja Aleksandra 73"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Grad"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      placeholder="Beograd"
                    />
                    <Input
                      label="Poštanski broj"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                      placeholder="11000"
                    />
                  </div>
                  <Input
                    label="Država"
                    value={shippingData.country}
                    disabled
                  />
                </div>
              )}

              {/* STEP 2: PAYMENT */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Način plaćanja</h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 font-medium">Kreditna Kartica</span>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 font-medium">Plaćanje pouzećem</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold mb-4">Potvrda narudžbine</h2>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Dostava na:</strong> {shippingData.street}, {shippingData.postalCode} {shippingData.city}</p>
                    <p><strong>Način plaćanja:</strong> {paymentMethod === 'card' ? 'Kreditna kartica' : 'Pouzećem'}</p>
                    <p><strong>Kupac:</strong> {user?.firstName} {user?.lastName} ({user?.email})</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Nazad
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button variant="primary" onClick={handleNext}>
                    Sledeći korak
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmitOrder}
                    isLoading={isProcessing}
                  >
                    Završi kupovinu
                  </Button>
                )}
              </div>

            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={cart.items}
              total={cart.totalAmount}
              city={shippingData.city} // Prosleđujemo grad za Weather Widget
            />
          </div>

        </div>
      </div>
    </div>
  );
}
