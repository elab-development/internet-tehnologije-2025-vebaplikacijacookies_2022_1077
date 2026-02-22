'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hvala na kupovini!</h1>
        <p className="text-gray-600 mb-8">
          Vaša narudžbina je uspešno primljena i biće uskoro obrađena. Poslali smo vam potvrdu na email.
        </p>

        <div className="space-y-3">
          <Link href="/products" className="block w-full">
            <Button variant="primary" fullWidth>Nastavi kupovinu</Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="ghost" fullWidth>Povratak na početnu</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
