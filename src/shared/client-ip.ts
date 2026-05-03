import { isProductionEnvironment } from './env-detection.js';

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX =
  /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^:(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;

const PRIVATE_IPV4_PREFIXES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^127\./,
  /^0\./,
];

const HEADER_PRIORITY = [
  'cf-connecting-ip',
  'x-real-ip',
  'x-forwarded-for',
];

export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed);
}

/** Value safe for Postgres `inet` columns (not valid → null; never literal `unknown`). */
export function inetColumnOrNull(ip: string | null | undefined): string | null {
  if (!ip || typeof ip !== 'string') return null;
  const trimmed = ip.trim();
  if (!trimmed || trimmed === 'unknown') return null;
  return isValidIP(trimmed) ? trimmed : null;
}

export function isPrivateOrLocalhost(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return true;
  const trimmed = ip.trim();
  if (trimmed === '127.0.0.1' || trimmed === '::1' || trimmed === 'localhost') return true;
  if (PRIVATE_IPV4_PREFIXES.some((re) => re.test(trimmed))) return true;
  return false;
}

function parseFirstPublicIp(value: string): string | null {
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const forMatch = part.match(/for="?([^";]+)"?/i);
    const ip = forMatch ? forMatch[1].trim() : part;
    if (isValidIP(ip) && !isPrivateOrLocalhost(ip)) return ip;
  }

  const first = parts[0];
  if (first) {
    const forMatch = first.match(/for="?([^";]+)"?/i);
    const ip = forMatch ? forMatch[1].trim() : first;
    if (isValidIP(ip)) return ip;
  }
  return null;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

export function rateLimitIdentifier(
  ip: string,
  fallbacks?: { fingerprint?: string; userAgent?: string },
): string {
  if (ip !== 'unknown') return ip;
  const fp = fallbacks?.fingerprint;
  if (fp) return `unknown:fp:${fp}`;
  const ua = fallbacks?.userAgent;
  if (ua) return `unknown:ua:${simpleHash(ua)}`;
  return 'unknown';
}

/**
 * Extract client IP from Fastify request headers.
 * Returns 'unknown' for invalid, private, or missing IP.
 */
export function extractClientIP(headers: Record<string, string | string[] | undefined>): string {
  for (const header of HEADER_PRIORITY) {
    const raw = headers[header];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) continue;

    const ip = parseFirstPublicIp(value);
    if (ip) {
      if (isProductionEnvironment() && isPrivateOrLocalhost(ip)) {
        return 'unknown';
      }
      return ip;
    }
  }
  return 'unknown';
}
