'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useAuth } from '@/hooks/useAuth';

export function RecommendedProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/user/recommendations');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || products.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl my-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preporučeno za vas</h2>
          <p className="text-gray-600 mt-1">
            Na osnovu vašeg interesovanja
          </p>
        </div>
        {/* Ovde može ići link "Vidi sve" */}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => {}} // Logika je unutar ProductCard ili parenta
              onViewDetails={() => window.location.href = `/products/${product.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
