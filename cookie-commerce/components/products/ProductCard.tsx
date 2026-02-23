// components/products/ProductCard.tsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  stock: number;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

/**
 * Komponenta za prikaz proizvoda u grid-u
 * Koristi reusable Card, Button komponente
 * 
 * @example
 * <ProductCard
 *   product={product}
 *   onAddToCart={(id) => handleAddToCart(id)}
 *   onViewDetails={(id) => router.push(`/products/${id}`)}
 * />
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const isOutOfStock = product.stock === 0;
  const { track } = useAnalytics();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const handleViewDetails = () => {
    track('product_click', { productId: product.id, name: product.name });
    onViewDetails?.(product.id);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || wishLoading) return;
    setWishLoading(true);
    try {
      if (inWishlist) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE', credentials: 'include' });
        setInWishlist(false);
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: product.id }),
        });
        setInWishlist(true);
      }
    } catch (err) { console.error(err); }
    finally { setWishLoading(false); }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card variant="elevated" clickable padding="none">
      {/* Slika proizvoda */}
      <div className="relative w-full h-48 bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Nema na stanju
          </div>
        )}

        {/* Low stock badge */}
        {!isOutOfStock && product.stock < 5 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Samo {product.stock} kom
          </div>
        )}

        {/* Wishlist heart button */}
        {user && (
          <button
            onClick={toggleWishlist}
            disabled={wishLoading}
            className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center transition-all"
            title={inWishlist ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
          >
            <svg className={`w-5 h-5 transition-colors ${inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Sadržaj kartice */}
      <CardBody className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </CardBody>

      {/* Footer sa akcijama */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleViewDetails}
        >
          Detalji
        </Button>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product.id)}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        >
          {isOutOfStock ? 'Nema na stanju' : 'Dodaj'}
        </Button>
      </CardFooter>
    </Card>
  );
};