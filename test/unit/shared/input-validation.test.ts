import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateName,
  validateUuid,
  validateCountryCode,
  validateFingerprintHash,
  isValidEmail,
} from '../../../src/shared/input-validation.js';

describe('input-validation', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should lowercase email', () => {
      const result = validateEmail('Test@Example.COM');
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject empty email', () => {
      expect(validateEmail('').isValid).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(validateEmail('not-an-email').isValid).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should return false for non-string', () => {
      expect(isValidEmail(123)).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should accept valid name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('John Doe');
    });

    it('should strip HTML tags', () => {
      const result = validateName('<script>alert("xss")</script>John');
      expect(result.sanitized).not.toContain('<script>');
    });

    it('should reject too short names', () => {
      expect(validateName('J').isValid).toBe(false);
    });
  });

  describe('validateUuid', () => {
    it('should accept valid UUID v4', () => {
      const result = validateUuid('550e8400-e29b-41d4-a716-446655440000');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(validateUuid('not-a-uuid').isValid).toBe(false);
    });

    it('should allow optional UUID', () => {
      expect(validateUuid('', { required: false }).isValid).toBe(true);
    });
  });

  describe('validateCountryCode', () => {
    it('should accept valid codes', () => {
      expect(validateCountryCode('US').isValid).toBe(true);
      expect(validateCountryCode('br').sanitized).toBe('BR');
    });

    it('should reject invalid codes', () => {
      expect(validateCountryCode('USA').isValid).toBe(false);
      expect(validateCountryCode('1').isValid).toBe(false);
    });
  });

  describe('validateFingerprintHash', () => {
    it('should accept valid hash', () => {
      expect(validateFingerprintHash('abc123DEF456').isValid).toBe(true);
    });

    it('should reject too long hash', () => {
      expect(validateFingerprintHash('a'.repeat(129)).isValid).toBe(false);
    });

    it('should allow optional', () => {
      expect(validateFingerprintHash('', { required: false }).isValid).toBe(true);
    });
  });
});
