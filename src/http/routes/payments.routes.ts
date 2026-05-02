import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { VerifyAndFulfillUseCase } from '../../core/use-cases/payments/verify-and-fulfill.use-case.js';
import type { CapturePaymentUseCase } from '../../core/use-cases/payments/capture-payment.use-case.js';
import type { RecordFailedPaymentUseCase, RecordFailedPaymentDto } from '../../core/use-cases/payments/record-failed-payment.use-case.js';
import type { VerifyPaymentDto, CapturePaymentDto } from '../../core/use-cases/payments/payment.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';
import {
  verifyPaymentBodySchema,
  capturePaymentBodySchema,
} from '../schemas/payments.schema.js';

const paymentRateLimit = createRateLimitGuard({ endpoint: 'payment', limit: 10, windowMinutes: 1, failClosed: true });

export async function paymentRoutes(app: FastifyInstance) {
  // Guest-safe: no authGuard. Both guests and authenticated users call verify
  // after Stripe confirms payment. Rate limiting + payment_intent_id validation
  // prevent abuse. The use case performs risk assessment internally.
  app.post<{ Body: VerifyPaymentDto }>(
    '/verify',
    {
      preHandler: [paymentRateLimit],
      schema: { body: verifyPaymentBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<VerifyAndFulfillUseCase>(UC_TOKENS.VerifyAndFulfill);
      const reqCtx = buildRequestContext(request, request.body as unknown as Record<string, unknown>);
      const result = await uc.execute(
        request.body,
        reqCtx.clientIP,
        reqCtx.userAgent ?? 'unknown',
      );
      return reply.send(result);
    },
  );

  // Guest-safe: no authGuard. PayPal capture is triggered from client after
  // payer approval, before a Supabase session may exist. Origin + rate limit
  // protect the endpoint.
  app.post<{ Body: CapturePaymentDto }>(
    '/capture',
    {
      preHandler: [paymentRateLimit],
      schema: { body: capturePaymentBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<CapturePaymentUseCase>(UC_TOKENS.CapturePayment);
      const result = await uc.execute(request.body);
      return reply.send(result);
    },
  );

  app.post<{ Body: RecordFailedPaymentDto }>(
    '/record-failure',
    {
      preHandler: [paymentRateLimit],
    },
    async (request, reply) => {
      const uc = container.resolve<RecordFailedPaymentUseCase>(UC_TOKENS.RecordFailedPayment);
      await uc.execute(request.body);
      return reply.send({ success: true });
    },
  );
}
