import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { SubscribeUseCase } from '../../core/use-cases/newsletter/subscribe.use-case.js';
import type { ConfirmUseCase } from '../../core/use-cases/newsletter/confirm.use-case.js';
import type { UnsubscribeUseCase } from '../../core/use-cases/newsletter/unsubscribe.use-case.js';
import type { NewsletterSubscribeDto } from '../../core/use-cases/newsletter/newsletter.types.js';
import { buildRequestContext } from '../middleware/request-context.js';
import { subscribeBodySchema, tokenBodySchema } from '../schemas/newsletter.schema.js';

export async function newsletterRoutes(app: FastifyInstance) {
  app.post<{ Body: NewsletterSubscribeDto }>(
    '/subscribe',
    { schema: { body: subscribeBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<SubscribeUseCase>(UC_TOKENS.Subscribe);
      const reqCtx = buildRequestContext(request);
      const result = await uc.execute(request.body, reqCtx.clientIP);
      return reply.send(result);
    },
  );

  app.post<{ Body: { token: string } }>(
    '/confirm',
    { schema: { body: tokenBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<ConfirmUseCase>(UC_TOKENS.Confirm);
      const result = await uc.execute(request.body.token);
      return reply.send(result);
    },
  );

  app.post<{ Body: { token: string } }>(
    '/unsubscribe',
    { schema: { body: tokenBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<UnsubscribeUseCase>(UC_TOKENS.Unsubscribe);
      const result = await uc.execute(request.body.token);
      return reply.send(result);
    },
  );
}
