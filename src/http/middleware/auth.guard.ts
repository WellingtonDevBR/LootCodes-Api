import type { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IAuthProvider } from '../../core/ports/auth.port.js';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const authProvider = container.resolve<IAuthProvider>(TOKENS.AuthProvider);
  const user = await authProvider.getUserByToken(token);

  if (!user) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }

  (request as unknown as Record<string, unknown>).authUser = user;
}
