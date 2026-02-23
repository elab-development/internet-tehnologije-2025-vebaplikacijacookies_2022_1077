// components/cart/CartItem.tsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { CartItem as CartItemType } from '@/hooks/useCart';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
}

/**
 * Komponenta za prikaz stavke u korpi
 */
export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { track } = useAnalytics();

  const { product, quantity, priceAtAdd } = item;

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      // eslint-disable-next-line no-alert
      alert(`Dostupno samo ${product.stock} komada`);
      return;
    }

    if (newQuantity > quantity) {
      track('add_to_cart', { productId: product.id, quantity: newQuantity - quantity });
    }

    setIsUpdating(true);
    await onUpdateQuantity(product.id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm('Da li ste sigurni da želite da uklonite ovaj proizvod iz korpe?')) {
      return;
    }

    setIsRemoving(true);
    await onRemove(product.id);
    setIsRemoving(false);
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

  const subtotal = priceAtAdd * quantity;
  const isPriceChanged = product.price !== priceAtAdd;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Slika proizvoda */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Detalji proizvoda */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* Cena */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(priceAtAdd, product.currency)}
          </span>
          
          {isPriceChanged && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price, product.currency)}
              </span>
              <span className="text-xs text-orange-600 font-medium">
                Cena se promenila
              </span>
            </div>
          )}
        </div>

        {/* Kontrole količine */}
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <span className="px-4 py-1 font-medium min-w-[3rem] text-center">
              {quantity}
            </span>

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating || quantity >= product.stock}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Stock Info */}
          <span className="text-sm text-gray-500">
            {product.stock > 0 ? (
              product.stock < 5 ? (
                <span className="text-orange-600">Samo {product.stock} kom</span>
              ) : (
                <span className="text-green-600">Na stanju</span>
              )
            ) : (
              <span className="text-red-600">Nema na stanju</span>
            )}
          </span>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            isLoading={isRemoving}
            className="ml-auto"
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
            Ukloni
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex flex-col items-end justify-between">
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Ukupno</p>
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(subtotal, product.currency)}
          </p>
        </div>
      </div>
    </div>
  );
};