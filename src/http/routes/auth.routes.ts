import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IAuthService } from '../../core/ports/auth-service.port.js';
import type { AuthRequestDto } from '../../core/services/auth/auth.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { authRequestSchema, authActionRouteSchema } from '../schemas/auth.schema.js';

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: AuthRequestDto }>(
    '/',
    {
      schema: {
        body: authRequestSchema,
      },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = request.body;
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = { ...request.body, action: 'sign_in' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = { ...request.body, action: 'sign_up' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = { ...request.body, action: 'password_reset' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = { ...request.body, action: 'send-otp' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
      schema: { body: authActionRouteSchema },
    },
    async (request, reply) => {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const body = { ...request.body, action: 'verify-otp' as const };
      const reqCtx = buildRequestContext(request, body as unknown as Record<string, unknown>);

      const result = await authService.handleAuth(body, {
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
