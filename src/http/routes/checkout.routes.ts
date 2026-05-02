import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { InitializeCheckoutUseCase } from '../../core/use-cases/checkout/initialize-checkout.use-case.js';
import type { UpdateCheckoutUseCase } from '../../core/use-cases/checkout/update-checkout.use-case.js';
import type { CancelCheckoutUseCase } from '../../core/use-cases/checkout/cancel-checkout.use-case.js';
import type { CheckoutWithApprovalUseCase } from '../../core/use-cases/checkout/checkout-with-approval.use-case.js';
import type { ValidatePromoCodeUseCase } from '../../core/use-cases/checkout/validate-promo-code.use-case.js';
import type { GetPaymentMethodsConfigUseCase } from '../../core/use-cases/checkout/get-payment-methods-config.use-case.js';
import type { ValidateApprovalTokenUseCase } from '../../core/use-cases/checkout/validate-approval-token.use-case.js';
import type { CheckoutInitDto, CheckoutApprovalDto, CheckoutUpdateDto } from '../../core/use-cases/checkout/checkout.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';
import {
  initCheckoutBodySchema,
  approvalCheckoutBodySchema,
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

const checkoutRateLimit = createRateLimitGuard({ endpoint: 'checkout', limit: 20, windowMinutes: 1 });

export async function checkoutRoutes(app: FastifyInstance) {
  app.post<{ Body: CheckoutInitDto }>(
    '/',
    {
      preHandler: [checkoutRateLimit, optionalAuthGuard],
      schema: { body: initCheckoutBodySchema },
    },
    async (request, reply) => {
      const initCheckout = container.resolve<InitializeCheckoutUseCase>(UC_TOKENS.InitializeCheckout);
      const user = tryGetAuthUser(request);
      const reqCtx = buildRequestContext(request, request.body as unknown as Record<string, unknown>);

      const result = await initCheckout.execute(dto(request.body), user?.id, reqCtx.clientIP);
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
      const updateCheckout = container.resolve<UpdateCheckoutUseCase>(UC_TOKENS.UpdateCheckout);
      const user = tryGetAuthUser(request);

      const result = await updateCheckout.execute(request.body, user?.id);
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
      const cancelCheckout = container.resolve<CancelCheckoutUseCase>(UC_TOKENS.CancelCheckout);
      const user = tryGetAuthUser(request);

      await cancelCheckout.execute(request.params.orderId, user?.id);
      return reply.send({ success: true });
    },
  );

  app.post<{ Body: CheckoutApprovalDto }>(
    '/approval',
    {
      preHandler: [optionalAuthGuard],
      schema: { body: approvalCheckoutBodySchema },
    },
    async (request, reply) => {
      const checkoutWithApproval = container.resolve<CheckoutWithApprovalUseCase>(UC_TOKENS.CheckoutWithApproval);
      const user = tryGetAuthUser(request);
      const reqCtx = buildRequestContext(request, request.body as unknown as Record<string, unknown>);

      const result = await checkoutWithApproval.execute(request.body, user?.id, reqCtx.clientIP);
      return reply.send(result);
    },
  );

  app.get(
    '/payment-methods',
    async (_request, reply) => {
      const getConfig = container.resolve<GetPaymentMethodsConfigUseCase>(UC_TOKENS.GetPaymentMethodsConfig);
      const config = await getConfig.execute();
      return reply.send(config);
    },
  );

  app.post<{ Body: { code: string; items?: { variant_id: string; quantity: number }[]; cart_items?: { variant_id: string; quantity: number }[]; subtotal_cents?: number; user_id?: string; guest_email?: string; checkout_currency?: string } }>(
    '/validate-promo',
    {
      schema: { body: validatePromoBodySchema },
    },
    async (request, reply) => {
      const validatePromo = container.resolve<ValidatePromoCodeUseCase>(UC_TOKENS.ValidatePromoCode);
      const user = tryGetAuthUser(request);

      const items = request.body.items ?? request.body.cart_items ?? [];
      const result = await validatePromo.execute(
        request.body.code,
        items,
        user?.id ?? request.body.user_id,
      );
      return reply.send(result);
    },
  );

  app.get<{ Querystring: { holdId: string; token: string } }>(
    '/approval-token',
    async (request, reply) => {
      const uc = container.resolve<ValidateApprovalTokenUseCase>(UC_TOKENS.ValidateApprovalToken);
      const result = await uc.execute(request.query.holdId, request.query.token);
      if (!result) {
        return reply.code(404).send({ error: 'Approval token not found or expired' });
      }
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
    wallet_redeem_cents: body.wallet_redeem_cents,
    customer_email: body.customer_email,
    customer_name: body.customer_name,
    billing_address: body.billing_address,
  };
}
