export { constantTimeEqual } from './timing-safe.js';

export interface ValidationResult {
  isValid: boolean;
  sanitized?: string;
  error?: string;
}

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  preserveNewlines?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
const FINGERPRINT_HASH_REGEX = /^[a-zA-Z0-9_/+=.-]+$/;

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_REGEX.test(trimmed);
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) return { isValid: false, error: 'Email is required' };
  if (trimmed.length > EMAIL_MAX_LENGTH) return { isValid: false, error: 'Email is too long' };
  if (!EMAIL_REGEX.test(trimmed)) return { isValid: false, error: 'Invalid email format' };
  return { isValid: true, sanitized: trimmed.toLowerCase() };
};

export const validateName = (name: string, options: ValidationOptions = {}): ValidationResult => {
  const { required = true, minLength = 2, maxLength = 50 } = options;
  if (!name || typeof name !== 'string') {
    return { isValid: !required, error: required ? 'Name is required' : undefined };
  }
  const sanitized = name
    .replace(/<[^>]*>?/gm, '')
    .replace(/[^a-zA-Z0-9\s'\-.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (required && sanitized.length === 0) return { isValid: false, error: 'Name is required' };
  if (sanitized.length < minLength) return { isValid: false, error: `Name must be at least ${minLength} characters` };
  if (sanitized.length > maxLength) return { isValid: false, error: `Name must be no more than ${maxLength} characters` };
  return { isValid: true, sanitized };
};

export const validateUuid = (
  value: unknown,
  options: { required?: boolean } = {},
): ValidationResult => {
  const { required = true } = options;
  if (value === null || value === undefined || value === '') {
    return { isValid: !required, error: required ? 'Invalid UUID format' : undefined };
  }
  const str = String(value).trim();
  if (str.length === 0) return { isValid: !required, error: required ? 'Invalid UUID format' : undefined };
  if (!UUID_REGEX.test(str)) return { isValid: false, error: 'Invalid UUID format' };
  return { isValid: true, sanitized: str };
};

export const validateCountryCode = (
  value: unknown,
  options: { required?: boolean } = {},
): ValidationResult => {
  const { required = true } = options;
  if (value === null || value === undefined || value === '') {
    return { isValid: !required, error: required ? 'Country code is required' : undefined };
  }
  if (typeof value !== 'string') return { isValid: false, error: 'Invalid country code' };
  const upper = value.trim().toUpperCase();
  if (!COUNTRY_CODE_REGEX.test(upper)) return { isValid: false, error: 'Invalid country code' };
  return { isValid: true, sanitized: upper };
};

export const validateFingerprintHash = (
  value: unknown,
  options: { required?: boolean } = {},
): ValidationResult => {
  const { required = false } = options;
  if (value === null || value === undefined || value === '') {
    return { isValid: !required, error: required ? 'Fingerprint hash is required' : undefined };
  }
  if (typeof value !== 'string') return { isValid: false, error: 'Invalid fingerprint hash' };
  const trimmed = value.trim();
  if (trimmed.length > 128 || !FINGERPRINT_HASH_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Invalid fingerprint hash' };
  }
  return { isValid: true, sanitized: trimmed };
};

export const sanitizeText = (text: string, options: ValidationOptions = {}): ValidationResult => {
  const { required = false, maxLength = 1000 } = options;
  if (!text || typeof text !== 'string') {
    return { isValid: !required, error: required ? 'Text is required' : undefined };
  }
  const sanitized = text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>&"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (required && sanitized.length === 0) return { isValid: false, error: 'Text is required' };
  if (sanitized.length > maxLength) return { isValid: false, error: `Text must be no more than ${maxLength} characters` };
  return { isValid: true, sanitized };
};
