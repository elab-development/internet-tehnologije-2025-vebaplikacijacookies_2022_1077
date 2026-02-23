// lib/utils/validation.ts

/**
 * Validacioni helper funkcije
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validira email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validira broj telefona (opciono, ali ako postoji mora biti validan)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validira cenu (mora biti pozitivna)
 */
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

/**
 * Validira stock (mora biti nenegativan ceo broj)
 */
export function validateStock(stock: number): boolean {
  return Number.isInteger(stock) && stock >= 0;
}

/**
 * Validira ID format (CUID)
 */
export function validateId(id: string): boolean {
  // CUID format: c + 24 karaktera (base32)
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
}

/**
 * Sanitizuje string (uklanja HTML tagove)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validira pagination parametre
 */
export function validatePagination(page: number, limit: number): {
  isValid: boolean;
  error?: string;
} {
  if (page < 1) {
    return { isValid: false, error: 'Page mora biti >= 1' };
  }

  if (limit < 1 || limit > 100) {
    return { isValid: false, error: 'Limit mora biti između 1 i 100' };
  }

  return { isValid: true };
}

/**
 * Validira sort parametre
 */
export function validateSort(
  sortBy: string,
  allowedFields: string[]
): boolean {
  return allowedFields.includes(sortBy);
}

/**
 * Validira jačinu lozinke
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Lozinka mora imati najmanje 8 karaktera');
  if (!/[0-9]/.test(password)) errors.push('Lozinka mora sadržati bar jedan broj');
  if (!/[A-Z]/.test(password)) errors.push('Lozinka mora sadržati bar jedno veliko slovo');

  return {
    isValid: errors.length === 0,
    errors,
  };
}