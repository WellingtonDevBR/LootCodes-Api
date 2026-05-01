import type { IRateLimiter } from '../../ports/rate-limiter.port.js';
import type { IIpBlocklist } from '../../ports/ip-blocklist.port.js';
import { ForbiddenError, RateLimitError } from '../../errors/domain-errors.js';
import { createLogger } from '../../../shared/logger.js';

const logger = createLogger('checkout-security');

export async function enforceCheckoutSecurity(
  ipAddress: string,
  ipBlocklist: IIpBlocklist,
  rateLimiter: IRateLimiter,
): Promise<void> {
  try {
    const blocked = await ipBlocklist.isBlocked(ipAddress);
    if (blocked) throw new ForbiddenError('Access denied');
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
  }

  try {
    const config = await rateLimiter.getConfig('rate_limit_checkout');
    const result = await rateLimiter.check({
      ipAddress,
      endpoint: 'checkout',
      limit: config.perIpHourly,
      windowMinutes: 60,
    });

    if (!result.allowed) {
      throw new RateLimitError('Too many checkout attempts', 60);
    }
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    logger.warn('Checkout rate limit check failed', err as Error);
  }
}
