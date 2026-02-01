// components/ui/Input.tsx

import React, { useState, useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  fullWidth?: boolean;
}

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
    const reactId = useId();
    const inputId = id || reactId; // ✅ stabilan ID za SSR + client

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
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className={inputWrapperStyles}>
          {leftIcon && <div className={leftIconStyles}>{leftIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputStyles}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {rightIcon && <div className={rightIconStyles}>{rightIcon}</div>}
        </div>

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