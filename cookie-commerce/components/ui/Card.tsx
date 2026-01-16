// components/ui/Card.tsx

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Varijanta kartice
   */
  variant?: 'default' | 'bordered' | 'elevated';
  
  /**
   * Da li je kartica klikabilna (hover efekat)
   */
  clickable?: boolean;
  
  /**
   * Padding veličina
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Reusable Card komponenta
 * 
 * @example
 * <Card variant="elevated" clickable>
 *   <CardHeader>
 *     <h3>Naslov</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Sadržaj kartice</p>
 *   </CardBody>
 * </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      clickable = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    // ==========================================
    // STILOVI PO VARIJANTAMA
    // ==========================================
    
    const variantStyles = {
      default: 'bg-white',
      bordered: 'bg-white border-2 border-gray-200',
      elevated: 'bg-white shadow-lg',
    };

    // ==========================================
    // STILOVI ZA PADDING
    // ==========================================
    
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    // ==========================================
    // BAZNI STILOVI
    // ==========================================
    
    const baseStyles = cn(
      'rounded-lg overflow-hidden',
      'transition-all duration-200',
      variantStyles[variant],
      paddingStyles[padding],
      clickable && 'cursor-pointer hover:shadow-xl hover:scale-[1.02]',
      className
    );

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ==========================================
// SUB-KOMPONENTE
// ==========================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4 pt-4 border-t border-gray-200', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';