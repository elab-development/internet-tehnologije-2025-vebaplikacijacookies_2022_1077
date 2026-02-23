import { validateEmail, validatePasswordStrength } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('returns false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('validates strong password', () => {
      const result = validatePasswordStrength('StrongP@ss1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails for short password', () => {
      const result = validatePasswordStrength('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Lozinka mora imati najmanje 8 karaktera');
    });

    it('fails for password without number', () => {
      const result = validatePasswordStrength('NoNumberPass');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Lozinka mora sadržati bar jedan broj');
    });
  });
});
