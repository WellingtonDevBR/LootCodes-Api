import type { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IRateLimiter } from '../../core/ports/rate-limiter.port.js';
import { extractClientIP } from '../../shared/client-ip.js';
import { createLogger } from '../../shared/logger.js';

const logger = createLogger('rate-limit');

export interface RateLimitOptions {
  endpoint: string;
  limit: number;
  windowMinutes: number;
  failClosed?: boolean;
}

export function createRateLimitGuard(options: RateLimitOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const rateLimiter = container.resolve<IRateLimiter>(TOKENS.RateLimiter);
    const headers = request.headers as Record<string, string | string[] | undefined>;
    const ipAddress = extractClientIP(headers);

    try {
      const result = await rateLimiter.check({
        userId: null,
        ipAddress,
        endpoint: options.endpoint,
        limit: options.limit,
        windowMinutes: options.windowMinutes,
      });

      if (!result.allowed) {
        return reply
          .code(429)
          .header('Retry-After', String(options.windowMinutes * 60))
          .send({
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
          });
      }
    } catch (err) {
      logger.warn('Rate limit check failed', err as Error);
      if (options.failClosed) {
        return reply.code(429).send({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }
    }
  };
}
