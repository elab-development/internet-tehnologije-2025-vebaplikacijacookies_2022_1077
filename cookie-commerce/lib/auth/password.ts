// lib/auth/password.ts

import bcrypt from 'bcryptjs';

/**
 * Hešira lozinku korišćenjem bcrypt algoritma
 * @param password - Plain text lozinka
 * @returns Heširana lozinka
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Veći broj = sigurnije, ali sporije
  return bcrypt.hash(password, saltRounds);
}

/**
 * Poredi plain text lozinku sa heširanom
 * @param password - Plain text lozinka
 * @param hashedPassword - Heširana lozinka iz baze
 * @returns true ako se poklapaju
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validira jačinu lozinke
 * @param password - Lozinka za validaciju
 * @returns Objekat sa rezultatom validacije
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Lozinka mora imati najmanje 8 karaktera');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržati bar jedno veliko slovo');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržati bar jedno malo slovo');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Lozinka mora sadržati bar jedan broj');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}