import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { HandleAuthUseCase } from '../../core/use-cases/auth/handle-auth.use-case.js';
import type { AuthRequestDto } from '../../core/use-cases/auth/auth.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';
import { authRequestSchema, authActionRouteSchema } from '../schemas/auth.schema.js';

const authRateLimit = createRateLimitGuard({ endpoint: 'auth', limit: 10, windowMinutes: 1, failClosed: true });

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: AuthRequestDto }>(
    '/',
    {
      preHandler: [authRateLimit],
      schema: {
        body: authRequestSchema,
      },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = request.body;
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );

  app.post<{ Body: AuthRequestDto }>(
    '/sign-in',
    {
      preHandler: [authRateLimit],
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = { ...request.body, action: 'sign_in' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );

  app.post<{ Body: AuthRequestDto }>(
    '/sign-up',
    {
      preHandler: [authRateLimit],
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = { ...request.body, action: 'sign_up' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );

  app.post<{ Body: AuthRequestDto }>(
    '/password-reset',
    {
      preHandler: [authRateLimit],
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = { ...request.body, action: 'password_reset' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );

  app.post<{ Body: AuthRequestDto }>(
    '/phone/send-otp',
    {
      preHandler: [authRateLimit],
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = { ...request.body, action: 'send-otp' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );

  app.post<{ Body: AuthRequestDto }>(
    '/phone/verify-otp',
    {
      preHandler: [authRateLimit],
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
      const body = { ...request.body, action: 'verify-otp' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await handleAuth.execute(body, {
        requestId: reqCtx.requestId,
        ipAddress: reqCtx.clientIP,
        userAgent: reqCtx.userAgent ?? 'unknown',
        riskLevel: 'high',
        score: 0,
      });

      return reply.send(result);
    },
  );
}
