import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { ICheckoutService } from '../../core/ports/checkout-service.port.js';
import type { CheckoutInitDto, CheckoutUpdateDto } from '../../core/services/checkout/checkout.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { buildRequestContext } from '../middleware/request-context.js';
import {
  initCheckoutBodySchema,
  updateCheckoutBodySchema,
  cancelCheckoutParamsSchema,
  validatePromoBodySchema,
} from '../schemas/checkout.schema.js';

interface AuthUser {
  id: string;
  email?: string;
}

function tryGetAuthUser(request: unknown): AuthUser | undefined {
  return (request as Record<string, unknown>).authUser as AuthUser | undefined;
}

async function optionalAuthGuard(request: unknown, reply: unknown) {
  try {
    await authGuard(
      request as Parameters<typeof authGuard>[0],
      reply as Parameters<typeof authGuard>[1],
    );
  } catch {
    // Auth is optional — continue without user
  }
}

export async function checkoutRoutes(app: FastifyInstance) {
  app.post<{ Body: CheckoutInitDto }>(
    '/',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: initCheckoutBodySchema },
    },
    async (request, reply) => {
      const checkoutService = container.resolve<ICheckoutService>(TOKENS.CheckoutService);
      const user = tryGetAuthUser(request);
      const reqCtx = buildRequestContext(request, request.body as unknown as Record<string, unknown>);

      const result = await checkoutService.initializeCheckout(dto(request.body), user?.id, reqCtx.clientIP);
      return reply.send(result);
    },
  );

  app.put<{ Body: CheckoutUpdateDto }>(
    '/',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: updateCheckoutBodySchema },
    },
    async (request, reply) => {
      const checkoutService = container.resolve<ICheckoutService>(TOKENS.CheckoutService);
      const user = tryGetAuthUser(request);

      const result = await checkoutService.updateCheckout(request.body, user?.id);
      return reply.send(result);
    },
  );

  app.delete<{ Params: { orderId: string } }>(
    '/:orderId',
    {
      preHandler: [optionalAuthGuard],
      schema: { params: cancelCheckoutParamsSchema },
    },
    async (request, reply) => {
      const checkoutService = container.resolve<ICheckoutService>(TOKENS.CheckoutService);
      const user = tryGetAuthUser(request);

      await checkoutService.cancelCheckout(request.params.orderId, user?.id);
      return reply.send({ success: true });
    },
  );

  app.post<{ Body: { code: string; items: { variant_id: string; quantity: number }[] } }>(
    '/validate-promo',
    {
      schema: { body: validatePromoBodySchema },
    },
    async (request, reply) => {
      const checkoutService = container.resolve<ICheckoutService>(TOKENS.CheckoutService);
      const user = tryGetAuthUser(request);

      const result = await checkoutService.validatePromoCode(
        request.body.code,
        request.body.items,
        user?.id,
      );
      return reply.send(result);
    },
  );
}

function dto(body: CheckoutInitDto): CheckoutInitDto {
  return {
    items: body.items,
    currency: body.currency,
    promo_code: body.promo_code,
    session_id: body.session_id,
    fingerprint_hash: body.fingerprint_hash,
    recaptcha_token: body.recaptcha_token,
  };
}
