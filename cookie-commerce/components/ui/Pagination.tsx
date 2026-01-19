// components/ui/Pagination.tsx

'use client';

import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  className?: string;
}

/**
 * Pagination komponenta
 * 
 * @example
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   onPageChange={(page) => goToPage(page)}
 *   hasNextPage={true}
 *   hasPrevPage={true}
 * />
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
  className,
}) => {
  // ==========================================
  // GENERISANJE BROJEVA STRANICA
  // ==========================================

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maksimalno vidljivih brojeva

    if (totalPages <= maxVisible) {
      // Prikaži sve stranice
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Prikaži sa "..."
      if (currentPage <= 3) {
        // Početak
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Kraj
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Sredina
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // Ne prikazuj pagination ako ima samo jedna stranica
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
      >
        Prethodna
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                'px-3 py-2 rounded-lg font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        rightIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        }
      >
        Sledeća
      </Button>
    </div>
  );
};