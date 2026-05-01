import type { FastifyReply, FastifyRequest } from 'fastify';

const ALLOWED_CLIENTS = new Set(['lootcodes-web', 'lootcodes-app']);

export async function requestedByGuard(request: FastifyRequest, reply: FastifyReply) {
  const value = request.headers['x-requested-by'] as string | undefined;
  if (!value || !ALLOWED_CLIENTS.has(value)) {
    return reply.code(403).send({ error: 'Forbidden', code: 'INVALID_CLIENT' });
  }
}
