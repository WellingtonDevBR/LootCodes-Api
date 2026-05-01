import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { VerifyAndFulfillUseCase } from '../../core/use-cases/payments/verify-and-fulfill.use-case.js';
import type { CapturePaymentUseCase } from '../../core/use-cases/payments/capture-payment.use-case.js';
import type { VerifyPaymentDto, CapturePaymentDto } from '../../core/use-cases/payments/payment.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';
import {
  verifyPaymentBodySchema,
  capturePaymentBodySchema,
} from '../schemas/payments.schema.js';

const paymentRateLimit = createRateLimitGuard({ endpoint: 'payment', limit: 10, windowMinutes: 1, failClosed: true });

export async function paymentRoutes(app: FastifyInstance) {
  app.post<{ Body: VerifyPaymentDto }>(
    '/verify',
    {
      preHandler: [paymentRateLimit, authGuard],
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

  app.post<{ Body: CapturePaymentDto }>(
    '/capture',
    {
      preHandler: [paymentRateLimit, authGuard],
      schema: { body: capturePaymentBodySchema },
    },
    async (request, reply) => {
      const uc = container.resolve<CapturePaymentUseCase>(UC_TOKENS.CapturePayment);
      const result = await uc.execute(request.body);
      return reply.send(result);
    },
  );
}
