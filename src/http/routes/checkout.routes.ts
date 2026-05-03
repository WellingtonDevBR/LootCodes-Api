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

import type {

  CartItem,

  CheckoutApprovalDto,

  CheckoutInitDto,

  CheckoutResult,

  CheckoutUpdateDto,

} from '../../core/use-cases/checkout/checkout.types.js';

import { slicePaymentMethodsForProvider } from '../../core/use-cases/checkout/checkout.types.js';

import { getEnv } from '../../config/env.js';

import { authGuard } from '../middleware/auth.guard.js';

import { buildRequestContext } from '../middleware/request-context.js';

import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';

import {

  approvalCheckoutBodySchema,

  cancelCheckoutParamsSchema,

  initCheckoutBodySchema,

  updateCheckoutBodySchema,

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



function rowsToCartItemsForPromo(rows: unknown[]): CartItem[] {

  return rows.map((r) => {

    const row = r as Record<string, unknown>;

    const priceUsd =

      typeof row.price_usd === 'number'

        ? row.price_usd

        : typeof row.price_cents === 'number'

          ? row.price_cents

          : 0;

    return {

      variant_id: typeof row.variant_id === 'string' ? row.variant_id : '',

      quantity: typeof row.quantity === 'number' ? row.quantity : 1,

      price_usd: priceUsd,

      product_id: typeof row.product_id === 'string' ? row.product_id : undefined,

    };

  });

}



function getPublishableKeyForProvider(providerName: string): string {
  const env = getEnv();
  if (providerName.toLowerCase() === 'paypal') {
    return env.PAYPAL_CLIENT_ID ?? '';
  }
  return env.STRIPE_PUBLISHABLE_KEY ?? '';
}

async function checkoutSuccessEnvelope(result: CheckoutResult): Promise<Record<string, unknown>> {

  const getPm = container.resolve<GetPaymentMethodsConfigUseCase>(UC_TOKENS.GetPaymentMethodsConfig);

  const full = await getPm.execute();

  const paymentMethodsSlice = slicePaymentMethodsForProvider(full, result.payment_provider);



  return {

    success: true,

    order_id: result.order_id,

    order_number: result.order_number,

    amount: result.total_cents,

    currency:

      result.currency.trim().length === 3 ? result.currency.trim().toUpperCase() : result.currency.trim(),

    client_secret: result.client_secret,

    publishable_key: getPublishableKeyForProvider(result.payment_provider),

    payment_provider: result.payment_provider,

    payment_methods: paymentMethodsSlice,

    promo_code: result.promo_code,

    discount_amount_cents: result.discount_amount_cents,

    wallet_redeem_cents: result.wallet_redeem_cents,

  };

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

      return reply.send(await checkoutSuccessEnvelope(result));

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

      return reply.send(await checkoutSuccessEnvelope(result));

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

      return reply.send(await checkoutSuccessEnvelope(result));

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



  app.post<{

    Body: {

      code: string;

      items?: unknown[];

      cart_items?: unknown[];

      user_id?: string | null;

      guest_email?: string | null;

      checkout_currency?: string;

    };

  }>(

    '/validate-promo',

    {

      schema: { body: validatePromoBodySchema },

    },

    async (request, reply) => {

      const validatePromo = container.resolve<ValidatePromoCodeUseCase>(UC_TOKENS.ValidatePromoCode);

      const user = tryGetAuthUser(request);



      const canonicalItems =

        Array.isArray(request.body.items) && request.body.items.length > 0

          ? rowsToCartItemsForPromo(request.body.items as unknown[])

          : rowsToCartItemsForPromo((request.body.cart_items as unknown[]) ?? []);



      const result = await validatePromo.execute(

        request.body.code,

        canonicalItems,

        user?.id ?? request.body.user_id ?? undefined,

        typeof request.body.guest_email === 'string' ? request.body.guest_email : undefined,

        typeof request.body.checkout_currency === 'string' ? request.body.checkout_currency : undefined,

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

    payment_provider: body.payment_provider,

    customer_email: body.customer_email,

    customer_name: body.customer_name,

    billing_address: body.billing_address,

  };

}

