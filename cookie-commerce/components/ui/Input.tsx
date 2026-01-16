// components/ui/Input.tsx

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label tekst
   */
  label?: string;
  
  /**
   * Error poruka
   */
  error?: string;
  
  /**
   * Helper tekst ispod inputa
   */
  helperText?: string;
  
  /**
   * Ikonica sa leve strane
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ikonica sa desne strane
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Da li je input obavezan
   */
  required?: boolean;
  
  /**
   * Full width input
   */
  fullWidth?: boolean;
}

/**
 * Reusable Input komponenta sa validacijom
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="primer@email.com"
 *   error={errors.email}
 *   required
 * />
 * 
 * @example
 * <Input
 *   label="Pretraga"
 *   leftIcon={<SearchIcon />}
 *   placeholder="Pretraži proizvode..."
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required,
      fullWidth = true,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // ==========================================
    // STILOVI
    // ==========================================
    
    const containerStyles = cn(
      'flex flex-col gap-1.5',
      fullWidth && 'w-full'
    );

    const labelStyles = cn(
      'text-sm font-medium text-gray-700',
      error && 'text-red-600'
    );

    const inputWrapperStyles = cn(
      'relative flex items-center',
      fullWidth && 'w-full'
    );

    const inputStyles = cn(
      'w-full px-4 py-2 rounded-lg border',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : isFocused
        ? 'border-blue-500 ring-2 ring-blue-500'
        : 'border-gray-300 hover:border-gray-400',
      'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
      className
    );

    const iconStyles = 'absolute top-1/2 -translate-y-1/2 text-gray-400';
    const leftIconStyles = cn(iconStyles, 'left-3');
    const rightIconStyles = cn(iconStyles, 'right-3');

    const helperTextStyles = cn(
      'text-xs',
      error ? 'text-red-600' : 'text-gray-500'
    );

    return (
      <div className={containerStyles}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className={inputWrapperStyles}>
          {/* Left icon */}
          {leftIcon && <div className={leftIconStyles}>{leftIcon}</div>}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputStyles}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && <div className={rightIconStyles}>{rightIcon}</div>}
        </div>

        {/* Error message or helper text */}
        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : undefined}
            className={helperTextStyles}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';