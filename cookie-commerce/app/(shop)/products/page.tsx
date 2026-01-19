// app/(shop)/products/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/products/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

export default function ProductsPage() {
  const router = useRouter();
  const { categories } = useCategories();
  const {
    products,
    isLoading,
    error,
    pagination,
    filters,
    applyFilters,
    goToPage,
    resetFilters,
  } = useProducts({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // ==========================================
  // LOCAL STATE ZA FILTERE
  // ==========================================

  const [searchInput, setSearchInput] = useState('');
  const [priceRange, setPriceRange] = useState({
    min: '',
    max: '',
  });

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSearch = () => {
    applyFilters({ search: searchInput });
  };

  const handleCategoryChange = (categoryId: string) => {
    applyFilters({ categoryId: categoryId || undefined });
  };

  const handlePriceFilter = () => {
    applyFilters({
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    });
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    applyFilters({
      sortBy: field as any,
      sortOrder: order as 'asc' | 'desc',
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
    resetFilters();
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert('Proizvod dodat u korpu!');
      } else {
        const data = await response.json();
        alert(data.error || 'Greška pri dodavanju u korpu');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Došlo je do greške');
    }
  };

  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Proizvodi</h1>
          <p className="text-gray-600 mt-2">
            Pronađite savršen proizvod za vas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR - Filteri */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Filteri</h2>

              {/* Pretraga */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pretraga
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Pretraži proizvode..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    fullWidth={false}
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSearch}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  >
                    Traži
                  </Button>
                </div>
              </div>

              {/* Kategorije */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorija
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sve kategorije</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category._count?.products || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cenovni opseg */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena (RSD)
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Od"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    fullWidth
                  />
                  <Input
                    type="number"
                    placeholder="Do"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    fullWidth
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={handlePriceFilter}
                  >
                    Primeni
                  </Button>
                </div>
              </div>

              {/* Sortiranje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sortiraj po
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt-desc">Najnovije</option>
                  <option value="createdAt-asc">Najstarije</option>
                  <option value="price-asc">Cena: Rastuće</option>
                  <option value="price-desc">Cena: Opadajuće</option>
                  <option value="name-asc">Naziv: A-Z</option>
                  <option value="name-desc">Naziv: Z-A</option>
                </select>
              </div>

              {/* Reset filtera */}
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={handleResetFilters}
              >
                Resetuj filtere
              </Button>
            </div>
          </aside>

          {/* MAIN CONTENT - Proizvodi */}
          <main className="lg:col-span-3">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {isLoading ? (
                  'Učitavanje...'
                ) : (
                  <>
                    Prikazano <span className="font-semibold">{products.length}</span> od{' '}
                    <span className="font-semibold">{pagination.totalCount}</span> proizvoda
                  </>
                )}
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nema pronađenih proizvoda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Pokušajte sa drugim filterima ili pretragom
                    </p>
                    <Button variant="outline" onClick={handleResetFilters}>
                      Resetuj filtere
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={goToPage}
                      hasNextPage={pagination.hasNextPage}
                      hasPrevPage={pagination.hasPrevPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}