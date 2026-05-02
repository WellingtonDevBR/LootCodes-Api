import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS, TOKENS } from '../../di/tokens.js';
import type { IAuthProvider } from '../../core/ports/auth.port.js';
import type { GeolocateUseCase } from '../../core/use-cases/analytics/geolocate.use-case.js';
import type { ConvertCartPricesUseCase } from '../../core/use-cases/products/pricing/convert-cart-prices.use-case.js';
import type { GetActivePromoHeaderUseCase } from '../../core/use-cases/products/storefront/get-active-promo-header.use-case.js';
import type { GetTrustpilotDataUseCase } from '../../core/use-cases/products/storefront/get-trustpilot-data.use-case.js';
import type { GetHomepageDataUseCase } from '../../core/use-cases/storefront/get-homepage-data.use-case.js';
import type { ClaimReviewRewardUseCase } from '../../core/use-cases/wallet/claim-review-reward.use-case.js';
import type { MerchandisedSearchUseCase } from '../../core/use-cases/search/merchandised-search.use-case.js';
import { authGuard } from '../middleware/auth.guard.js';

interface AuthUser {
  id: string;
  email?: string;
}

export async function storefrontRoutes(app: FastifyInstance) {
  app.get('/visitor-country', async (request, reply) => {
    const geolocate = container.resolve<GeolocateUseCase>(UC_TOKENS.Geolocate);
    const result = await geolocate.execute(request.ip || 'unknown');
    return reply.send({
      country_code: result.country_code ?? null,
      country_name: result.country_name ?? null,
    });
  });

  app.get('/currency', async (request, reply) => {
    const geolocate = container.resolve<GeolocateUseCase>(UC_TOKENS.Geolocate);
    const result = await geolocate.execute(request.ip || 'unknown');
    const COUNTRY_CURRENCY: Record<string, string> = {
      US: 'USD', GB: 'GBP', BR: 'BRL', EU: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR',
      IT: 'EUR', PT: 'EUR', NL: 'EUR', CA: 'CAD', AU: 'AUD', JP: 'JPY',
    };
    const currency = COUNTRY_CURRENCY[result.country_code ?? ''] ?? 'USD';
    return reply.send({ currency, country_code: result.country_code ?? null });
  });

  app.post<{ Body: { variant_ids: string[]; currency: string } }>(
    '/cart/convert',
    {
      schema: {
        body: {
          type: 'object',
          required: ['variant_ids', 'currency'],
          properties: {
            variant_ids: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1, maxItems: 50 },
            currency: { type: 'string', minLength: 3, maxLength: 3 },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const uc = container.resolve<ConvertCartPricesUseCase>(UC_TOKENS.ConvertCartPrices);
      const prices = await uc.execute(request.body);
      return reply.send({ prices });
    },
  );

  app.get('/promo-header', async (_request, reply) => {
    const uc = container.resolve<GetActivePromoHeaderUseCase>(UC_TOKENS.GetActivePromoHeader);
    const promo = await uc.execute();
    return reply.send(promo);
  });

  app.post<{ Body: { review_id: string } }>(
    '/review-claim',
    {
      preHandler: [authGuard],
      schema: {
        body: {
          type: 'object',
          required: ['review_id'],
          properties: {
            review_id: { type: 'string', format: 'uuid' },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const user = (request as unknown as Record<string, unknown>).authUser as AuthUser;
      const uc = container.resolve<ClaimReviewRewardUseCase>(UC_TOKENS.ClaimReviewReward);
      const result = await uc.execute(user.id, request.body.review_id);
      return reply.send(result);
    },
  );

  app.get<{ Querystring: { query?: string; category?: string; limit?: number } }>(
    '/search/merchandising',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string', maxLength: 200 },
            category: { type: 'string', maxLength: 100 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      const uc = container.resolve<MerchandisedSearchUseCase>(UC_TOKENS.MerchandisedSearch);
      const result = await uc.execute({
        query: request.query.query ?? '',
        category: request.query.category,
        limit: request.query.limit ?? 20,
      });
      return reply.send(result);
    },
  );

  app.get('/trustpilot', async (_request, reply) => {
    const uc = container.resolve<GetTrustpilotDataUseCase>(UC_TOKENS.GetTrustpilotData);
    const data = await uc.execute();
    return reply.send(data);
  });

  app.get<{ Querystring: { session_id?: string } }>(
    '/homepage',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            session_id: { type: 'string', maxLength: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      let userId: string | undefined;
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const authProvider = container.resolve<IAuthProvider>(TOKENS.AuthProvider);
          const user = await authProvider.getUserByToken(authHeader.slice(7));
          if (user) userId = user.id;
        } catch {
          // Anonymous request — proceed without user
        }
      }

      const uc = container.resolve<GetHomepageDataUseCase>(UC_TOKENS.GetHomepageData);
      const data = await uc.execute({
        userId,
        sessionId: request.query.session_id,
      });
      return reply.send(data);
    },
  );
}
