'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { RecentlyViewed } from '@/components/products/RecentlyViewed';
import { useCart } from '@/hooks/useCart';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || 'Proizvod nije pronađen');
      }
    } catch (err) {
      setError('Došlo je do greške pri učitavanju');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    const result = await addItem(product.id, quantity);
    setIsAdding(false);

    if (result.success) {
      alert('Proizvod dodat u korpu!');
    } else {
      alert(result.error || 'Greška');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ups!</h2>
        <p className="text-gray-600 mb-6">{error || 'Proizvod ne postoji.'}</p>
        <Button variant="outline" onClick={() => router.push('/products')}>
          Nazad na prodavnicu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/')}>Početna</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push('/products')}>Proizvodi</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Slika */}
          <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="text-gray-400">Nema slike</div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <span className="text-blue-600 font-medium text-sm mb-2 uppercase tracking-wide">
                {product.category.name}
              </span>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-gray-900 mb-6">
              {formatPrice(product.price)}
            </p>

            <div className="prose prose-gray mb-8 text-gray-600 leading-relaxed">
              {product.description}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600 font-medium">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Na stanju ({product.stock} kom)
                </div>
              ) : (
                <div className="flex items-center text-red-600 font-medium">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Nema na stanju
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 border-t pt-8">
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-700 mb-1">Količina</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center border-none focus:ring-0 p-0 text-gray-900"
                  />
                  <button
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 pt-5 sm:pt-0 sm:self-end">
                <Button
                  size="lg"
                  fullWidth
                  variant="primary"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Nedostupno' : 'Dodaj u korpu'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">
              Besplatna dostava za porudžbine preko 5.000 RSD • 30 dana rok za povrat
            </p>
          </div>
        </div>

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>
    </div>
  );
}
