import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS, UC_TOKENS } from '../../di/tokens.js';
import type { VerifyAndFulfillUseCase } from '../../core/use-cases/payments/verify-and-fulfill.use-case.js';
import type { CapturePaymentUseCase } from '../../core/use-cases/payments/capture-payment.use-case.js';
import type { RecordFailedPaymentUseCase, RecordFailedPaymentDto } from '../../core/use-cases/payments/record-failed-payment.use-case.js';
import type { VerifyPaymentDto, CapturePaymentDto } from '../../core/use-cases/payments/payment.types.js';
import type { IBuyerCardChallengeProxy, ProxyRequest } from '../../core/ports/buyer-card-challenge-proxy.port.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { createRateLimitGuard } from '../middleware/rate-limit.guard.js';
import { buyerEdgeCardChallengeBodySchemaZ } from '../schemas/card-challenge-edge.schema.js';
import { verifyPaymentBodySchema, capturePaymentBodySchema } from '../schemas/payments.schema.js';

/** IP headers the upstream provider may use for per-client rate limiting / audit. */
const IP_HEADER_NAMES = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'] as const;

function buildProxyRequest(request: FastifyRequest, body: Record<string, unknown>): ProxyRequest {
  const h = request.headers;

  let origin = typeof h.origin === 'string' ? h.origin : undefined;
  if (!origin && typeof h.referer === 'string') {
    try { origin = new URL(h.referer).origin; } catch { /* ignore */ }
  }

  const ipHeaders: Record<string, string> = {};
  for (const name of IP_HEADER_NAMES) {
    const v = h[name];
    const value = typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
    if (value?.trim()) ipHeaders[name] = value;
  }

  const auth = h.authorization;
  return {
    body,
    authorization: typeof auth === 'string' && auth.startsWith('Bearer ') && auth.length > 14
      ? auth
      : undefined,
    origin,
    ipHeaders,
    userAgent: typeof h['user-agent'] === 'string' ? h['user-agent'] : undefined,
    requestedBy: typeof h['x-requested-by'] === 'string' ? (h['x-requested-by'] as string) : undefined,
  };
}

const paymentRateLimit = createRateLimitGuard({ endpoint: 'payment', limit: 10, windowMinutes: 1, failClosed: true });

export async function paymentRoutes(app: FastifyInstance) {
  // Guest-safe transparent proxy — domain logic lives upstream (adapter-swappable via DI).
  //
  // The upstream may return non-2xx for domain-level outcomes (410 expired,
  // 404 not_found, 503 feature_disabled) whose payloads the frontend
  // inspects via `res.success` / `res.status` fields in the JSON body.
  // `backendPost` on the client throws on non-2xx, preventing the frontend
  // from reading those bodies. We normalise self-describing domain responses
  // (JSON with a `success` field) to HTTP 200 so the frontend can
  // discriminate on the body. True transport errors (no parseable body)
  // keep their original status.
  app.post('/card-challenge', { preHandler: [paymentRateLimit] }, async (request, reply) => {
    const parsed = buyerEdgeCardChallengeBodySchemaZ.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ success: false, error: 'Invalid request body' });
    }
    const proxy = container.resolve<IBuyerCardChallengeProxy>(TOKENS.BuyerCardChallengeProxy);
    const proxyReq = buildProxyRequest(request, parsed.data as unknown as Record<string, unknown>);
    const { status, payload } = await proxy.forward(proxyReq);

    const isDomainResponse =
      payload != null
      && typeof payload === 'object'
      && 'success' in payload;

    return reply.code(isDomainResponse ? 200 : status).send(payload);
  });

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
