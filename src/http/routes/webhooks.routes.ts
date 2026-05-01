import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IWebhookService } from '../../core/ports/webhook-service.port.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.post(
    '/stripe',
    async (request, reply) => {
      const webhookService = container.resolve<IWebhookService>(TOKENS.WebhookService);
      const signature = request.headers['stripe-signature'] as string ?? '';
      const payload = request.body as string;

      const result = await webhookService.handleStripeWebhook(payload, signature);
      return reply.send(result);
    },
  );

  app.post(
    '/paypal',
    async (request, reply) => {
      const webhookService = container.resolve<IWebhookService>(TOKENS.WebhookService);
      const payload = request.body as string;
      const headers = request.headers as Record<string, string>;

      const result = await webhookService.handlePayPalWebhook(payload, headers);
      return reply.send(result);
    },
  );
}
