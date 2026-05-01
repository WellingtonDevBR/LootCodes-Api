import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { INewsletterService } from '../../core/ports/newsletter-service.port.js';
import type { NewsletterSubscribeDto } from '../../core/services/newsletter/newsletter.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { subscribeBodySchema, tokenBodySchema } from '../schemas/newsletter.schema.js';

export async function newsletterRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<INewsletterService>(TOKENS.NewsletterService);

  app.post<{ Body: NewsletterSubscribeDto }>(
    '/subscribe',
    { schema: { body: subscribeBodySchema } },
    async (request, reply) => {
      const reqCtx = buildRequestContext(request);
      const result = await resolveService().subscribe(request.body, reqCtx.clientIP);
      return reply.send(result);
    },
  );

  app.post<{ Body: { token: string } }>(
    '/confirm',
    { schema: { body: tokenBodySchema } },
    async (request, reply) => {
      const result = await resolveService().confirm(request.body.token);
      return reply.send(result);
    },
  );

  app.post<{ Body: { token: string } }>(
    '/unsubscribe',
    { schema: { body: tokenBodySchema } },
    async (request, reply) => {
      const result = await resolveService().unsubscribe(request.body.token);
      return reply.send(result);
    },
  );
}
