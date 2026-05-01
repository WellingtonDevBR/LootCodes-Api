import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IPaymentVerificationService } from '../../core/ports/payment-verification-service.port.js';
import type { IPaymentCaptureService } from '../../core/ports/payment-capture-service.port.js';
import type { VerifyPaymentDto, CapturePaymentDto } from '../../core/services/payments/payment.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import {
  verifyPaymentBodySchema,
  capturePaymentBodySchema,
} from '../schemas/payments.schema.js';

export async function paymentRoutes(app: FastifyInstance) {
  app.post<{ Body: VerifyPaymentDto }>(
    '/verify',
    {
      schema: { body: verifyPaymentBodySchema },
    },
    async (request, reply) => {
      const verificationService = container.resolve<IPaymentVerificationService>(
        TOKENS.PaymentVerificationService,
      );
      const reqCtx = buildRequestContext(request, request.body as unknown as Record<string, unknown>);

      const result = await verificationService.verifyAndFulfill(
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
      schema: { body: capturePaymentBodySchema },
    },
    async (request, reply) => {
      const captureService = container.resolve<IPaymentCaptureService>(
        TOKENS.PaymentCaptureService,
      );

      const result = await captureService.capturePayment(request.body);
      return reply.send(result);
    },
  );
}
