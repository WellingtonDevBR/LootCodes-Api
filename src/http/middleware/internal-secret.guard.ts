import type { FastifyReply, FastifyRequest } from 'fastify';
import { constantTimeEqual } from '../../shared/timing-safe.js';

export interface InternalSecretConfig {
  currentSecret: string;
  previousSecret?: string;
}

export function createInternalSecretGuard(config: InternalSecretConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const secret = request.headers['x-internal-secret'] as string | undefined;

    if (!secret) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const matchesCurrent = constantTimeEqual(secret, config.currentSecret);
    const matchesPrevious = config.previousSecret
      ? constantTimeEqual(secret, config.previousSecret)
      : false;

    if (!matchesCurrent && !matchesPrevious) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}
