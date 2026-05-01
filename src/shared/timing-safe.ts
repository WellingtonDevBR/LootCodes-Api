import crypto from 'node:crypto';

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  return crypto.timingSafeEqual(bufA, bufB);
}
