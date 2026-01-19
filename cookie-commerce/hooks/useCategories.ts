// hooks/useCategories.ts

'use client';

import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
  subcategories?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

/**
 * Custom hook za učitavanje kategorija
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
          throw new Error('Greška pri učitavanju kategorija');
        }

        const data = await response.json();
        setCategories(data.data);
      } catch (err: any) {
        console.error('Fetch categories error:', err);
        setError(err.message || 'Došlo je do greške');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}