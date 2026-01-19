// hooks/useProducts.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Custom hook za upravljanje proizvodima
 * 
 * @example
 * const { products, isLoading, pagination, applyFilters } = useProducts();
 */
export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Kreiraj query string
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Greška pri učitavanju proizvoda');
      }

      const data = await response.json();

      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.message || 'Došlo je do greške');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const applyFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset na prvu stranicu kada se primene filteri
    }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.page - 1);
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    products,
    isLoading,
    error,
    pagination,
    filters,
    applyFilters,
    goToPage,
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchProducts,
  };
}