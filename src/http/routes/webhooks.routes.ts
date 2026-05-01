import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { HandleStripeWebhookUseCase } from '../../core/use-cases/webhooks/handle-stripe-webhook.use-case.js';
import type { HandlePayPalWebhookUseCase } from '../../core/use-cases/webhooks/handle-paypal-webhook.use-case.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string', bodyLimit: 5 * 1024 * 1024 },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.post(
    '/stripe',
    async (request, reply) => {
      const uc = container.resolve<HandleStripeWebhookUseCase>(UC_TOKENS.HandleStripeWebhook);
      const signature = request.headers['stripe-signature'] as string ?? '';
      const payload = request.body as string;
      const result = await uc.execute(payload, signature);
      return reply.send(result);
    },
  );

  app.post(
    '/paypal',
    async (request, reply) => {
      const uc = container.resolve<HandlePayPalWebhookUseCase>(UC_TOKENS.HandlePayPalWebhook);
      const payload = request.body as string;
      const headers = request.headers as Record<string, string>;
      const result = await uc.execute(payload, headers);
      return reply.send(result);
    },
  );
}
