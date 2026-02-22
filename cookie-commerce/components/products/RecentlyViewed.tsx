'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { useAuth } from '@/hooks/useAuth';

export function RecentlyViewed() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      const res = await fetch('/api/user/recently-viewed');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recently viewed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || products.length === 0) return null;

  return (
    <div className="mt-16 border-t pt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Nedavno ste gledali
      </h2>

      {isLoading ? (
        <div className="text-center py-8">Učitavanje...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => {}} // Placeholder, logika je u ProductCard
              onViewDetails={() => window.location.href = `/products/${product.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
