import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { UC_TOKENS } from '../../di/tokens.js';
import type { StockCheckItem } from '../../core/use-cases/products/product.types.js';
import type { GetProductBySlugUseCase } from '../../core/use-cases/products/catalog/get-product-by-slug.use-case.js';
import type { GetProductByIdUseCase } from '../../core/use-cases/products/catalog/get-product-by-id.use-case.js';
import type { GetVariantsUseCase } from '../../core/use-cases/products/catalog/get-variants.use-case.js';
import type { GetGalleryUseCase } from '../../core/use-cases/products/catalog/get-gallery.use-case.js';
import type { GetFeaturedUseCase } from '../../core/use-cases/products/catalog/get-featured.use-case.js';
import type { BatchCheckStockUseCase } from '../../core/use-cases/products/stock/batch-check-stock.use-case.js';
import type { SubscribeStockNotificationUseCase } from '../../core/use-cases/products/stock/subscribe-stock-notification.use-case.js';
import type { UnsubscribeStockNotificationUseCase } from '../../core/use-cases/products/stock/unsubscribe-stock-notification.use-case.js';
import type { IsSubscribedToStockUseCase } from '../../core/use-cases/products/stock/is-subscribed-to-stock.use-case.js';
import type { IsVariantPurchasableUseCase } from '../../core/use-cases/products/stock/is-variant-purchasable.use-case.js';
import type { GetPlatformsUseCase } from '../../core/use-cases/products/reference/get-platforms.use-case.js';
import type { GetRegionsUseCase } from '../../core/use-cases/products/reference/get-regions.use-case.js';
import type { GetGenresUseCase } from '../../core/use-cases/products/reference/get-genres.use-case.js';
import type { GetFaqsUseCase } from '../../core/use-cases/products/reference/get-faqs.use-case.js';
import type { GetPlatformBySlugUseCase } from '../../core/use-cases/products/reference/get-platform-by-slug.use-case.js';
import type { GetPlatformNavItemsUseCase } from '../../core/use-cases/products/reference/get-platform-nav-items.use-case.js';
import type { GetPlatformFamilyBySlugUseCase } from '../../core/use-cases/products/reference/get-platform-family-by-slug.use-case.js';
import type { GetCategoriesUseCase } from '../../core/use-cases/products/categories/get-categories.use-case.js';
import type { GetCategoryBySlugUseCase } from '../../core/use-cases/products/categories/get-category-by-slug.use-case.js';
import type { GetSubcategoriesUseCase } from '../../core/use-cases/products/categories/get-subcategories.use-case.js';
import type { GetCategoryFaqsUseCase } from '../../core/use-cases/products/categories/get-category-faqs.use-case.js';
import type { GetLocalizedPriceUseCase } from '../../core/use-cases/products/pricing/get-localized-price.use-case.js';
import type { GetBatchLocalizedPricesUseCase } from '../../core/use-cases/products/pricing/get-batch-localized-prices.use-case.js';
import type { HasPricesForCurrencyUseCase } from '../../core/use-cases/products/pricing/has-prices-for-currency.use-case.js';
import type { SyncCurrencyRatesUseCase } from '../../core/use-cases/products/pricing/sync-currency-rates.use-case.js';
import type { IsCountryAllowedUseCase } from '../../core/use-cases/products/geo/is-country-allowed.use-case.js';
import type { GetExcludedCountriesUseCase } from '../../core/use-cases/products/geo/get-excluded-countries.use-case.js';
import type { GetRestrictedVariantsUseCase } from '../../core/use-cases/products/geo/get-restricted-variants.use-case.js';
import type { GetRestrictedRegionsUseCase } from '../../core/use-cases/products/geo/get-restricted-regions.use-case.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  slugParamsSchema,
  productIdParamsSchema,
  batchStockCheckBodySchema,
  stockNotificationSubscribeBodySchema,
  stockNotificationUnsubscribeBodySchema,
  variantIdParamsSchema,
  categoryIdParamsSchema,
  pricingQuerySchema,
  batchPricingBodySchema,
  currencyParamsSchema,
  geoCheckQuerySchema,
  regionIdParamsSchema,
  geoRestrictedVariantsQuerySchema,
  geoRestrictedRegionsQuerySchema,
} from '../schemas/products.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function productRoutes(app: FastifyInstance) {
  // ─── Catalog ────────────────────────────────────────────────────

  app.get<{ Params: { slug: string } }>(
    '/slug/:slug',
    { schema: { params: slugParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetProductBySlugUseCase>(UC_TOKENS.GetProductBySlug);
      const data = await uc.execute(request.params.slug);
      return reply.send(data);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetProductByIdUseCase>(UC_TOKENS.GetProductById);
      const product = await uc.execute(request.params.id);
      return reply.send(product);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id/variants',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetVariantsUseCase>(UC_TOKENS.GetVariants);
      const variants = await uc.execute(request.params.id);
      return reply.send(variants);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id/gallery',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetGalleryUseCase>(UC_TOKENS.GetGallery);
      const gallery = await uc.execute(request.params.id);
      return reply.send(gallery);
    },
  );

  app.get('/featured', async (_request, reply) => {
    const uc = container.resolve<GetFeaturedUseCase>(UC_TOKENS.GetFeatured);
    const featured = await uc.execute();
    return reply.send(featured);
  });

  // ─── Stock ──────────────────────────────────────────────────────

  app.post<{ Body: { items: StockCheckItem[] } }>(
    '/stock-check',
    { schema: { body: batchStockCheckBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<BatchCheckStockUseCase>(UC_TOKENS.BatchCheckStock);
      const results = await uc.execute(request.body.items);
      return reply.send(results);
    },
  );

  app.post<{ Body: { variant_id: string; email: string } }>(
    '/stock-notifications/subscribe',
    { preHandler: [authGuard], schema: { body: stockNotificationSubscribeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<SubscribeStockNotificationUseCase>(UC_TOKENS.SubscribeStockNotification);
      await uc.execute(authUser.id, request.body.variant_id, request.body.email);
      return reply.code(201).send({ success: true });
    },
  );

  app.delete<{ Body: { variant_id: string } }>(
    '/stock-notifications/unsubscribe',
    { preHandler: [authGuard], schema: { body: stockNotificationUnsubscribeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<UnsubscribeStockNotificationUseCase>(UC_TOKENS.UnsubscribeStockNotification);
      await uc.execute(authUser.id, request.body.variant_id);
      return reply.code(204).send();
    },
  );

  app.get<{ Params: { variantId: string } }>(
    '/stock-notifications/check/:variantId',
    { preHandler: [authGuard], schema: { params: variantIdParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const uc = container.resolve<IsSubscribedToStockUseCase>(UC_TOKENS.IsSubscribedToStock);
      const subscribed = await uc.execute(authUser.id, request.params.variantId);
      return reply.send({ subscribed });
    },
  );

  app.get<{ Params: { variantId: string }; Querystring: { quantity?: number } }>(
    '/variants/:variantId/purchasable',
    {
      schema: {
        params: {
          type: 'object',
          required: ['variantId'],
          properties: {
            variantId: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            quantity: { type: 'integer', minimum: 1, default: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const uc = container.resolve<IsVariantPurchasableUseCase>(UC_TOKENS.IsVariantPurchasable);
      const result = await uc.execute(request.params.variantId, request.query.quantity ?? 1);
      return reply.send(result);
    },
  );

  // ─── Reference Data ─────────────────────────────────────────────

  app.get('/platforms', async (_request, reply) => {
    const uc = container.resolve<GetPlatformsUseCase>(UC_TOKENS.GetPlatforms);
    const platforms = await uc.execute();
    return reply.send(platforms);
  });

  app.get('/regions', async (_request, reply) => {
    const uc = container.resolve<GetRegionsUseCase>(UC_TOKENS.GetRegions);
    const regions = await uc.execute();
    return reply.send(regions);
  });

  app.get('/genres', async (_request, reply) => {
    const uc = container.resolve<GetGenresUseCase>(UC_TOKENS.GetGenres);
    const genres = await uc.execute();
    return reply.send(genres);
  });

  app.get('/faqs', async (_request, reply) => {
    const uc = container.resolve<GetFaqsUseCase>(UC_TOKENS.GetFaqs);
    const faqs = await uc.execute();
    return reply.send(faqs);
  });

  app.get<{ Params: { slug: string } }>(
    '/platforms/:slug',
    { schema: { params: slugParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetPlatformBySlugUseCase>(UC_TOKENS.GetPlatformBySlug);
      const platform = await uc.execute(request.params.slug);
      return reply.send(platform);
    },
  );

  app.get('/platforms/nav', async (_request, reply) => {
    const uc = container.resolve<GetPlatformNavItemsUseCase>(UC_TOKENS.GetPlatformNavItems);
    const items = await uc.execute();
    return reply.send(items);
  });

  app.get<{ Params: { slug: string } }>(
    '/platform-families/:slug',
    { schema: { params: slugParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetPlatformFamilyBySlugUseCase>(UC_TOKENS.GetPlatformFamilyBySlug);
      const family = await uc.execute(request.params.slug);
      return reply.send(family);
    },
  );

  // ─── Categories ─────────────────────────────────────────────────

  app.get('/categories', async (_request, reply) => {
    const uc = container.resolve<GetCategoriesUseCase>(UC_TOKENS.GetCategories);
    const categories = await uc.execute();
    return reply.send(categories);
  });

  app.get<{ Params: { slug: string } }>(
    '/categories/:slug',
    { schema: { params: slugParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetCategoryBySlugUseCase>(UC_TOKENS.GetCategoryBySlug);
      const category = await uc.execute(request.params.slug);
      return reply.send(category);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/categories/:id/subcategories',
    { schema: { params: categoryIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetSubcategoriesUseCase>(UC_TOKENS.GetSubcategories);
      const subcategories = await uc.execute(request.params.id);
      return reply.send(subcategories);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/categories/:id/faqs',
    { schema: { params: categoryIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetCategoryFaqsUseCase>(UC_TOKENS.GetCategoryFaqs);
      const faqs = await uc.execute(request.params.id);
      return reply.send(faqs);
    },
  );

  // ─── Localized Pricing ──────────────────────────────────────────

  app.get<{ Params: { variantId: string }; Querystring: { currency: string } }>(
    '/pricing/variant/:variantId',
    { schema: { params: variantIdParamsSchema, querystring: pricingQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetLocalizedPriceUseCase>(UC_TOKENS.GetLocalizedPrice);
      const price = await uc.execute(request.params.variantId, request.query.currency);
      return reply.send(price ?? { price_cents: null, currency: request.query.currency });
    },
  );

  app.post<{ Body: { variantIds: string[]; currency: string } }>(
    '/pricing/batch',
    { schema: { body: batchPricingBodySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetBatchLocalizedPricesUseCase>(UC_TOKENS.GetBatchLocalizedPrices);
      const prices = await uc.execute(request.body.variantIds, request.body.currency);
      const result: Record<string, unknown> = {};
      for (const [k, v] of prices) result[k] = v;
      return reply.send(result);
    },
  );

  app.get<{ Params: { currency: string } }>(
    '/pricing/available/:currency',
    { schema: { params: currencyParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<HasPricesForCurrencyUseCase>(UC_TOKENS.HasPricesForCurrency);
      const has = await uc.execute(request.params.currency);
      return reply.send({ available: has });
    },
  );

  app.post('/pricing/sync-rates', async (_request, reply) => {
    const uc = container.resolve<SyncCurrencyRatesUseCase>(UC_TOKENS.SyncCurrencyRates);
    const result = await uc.execute();
    return reply.send(result ?? { synced: true });
  });

  // ─── Geo Restrictions ──────────────────────────────────────────

  app.get<{ Querystring: { regionId: string; countryCode: string } }>(
    '/geo/check',
    { schema: { querystring: geoCheckQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<IsCountryAllowedUseCase>(UC_TOKENS.IsCountryAllowed);
      const allowed = await uc.execute(request.query.regionId, request.query.countryCode);
      return reply.send({ allowed });
    },
  );

  app.get<{ Params: { regionId: string } }>(
    '/geo/excluded/:regionId',
    { schema: { params: regionIdParamsSchema } },
    async (request, reply) => {
      const uc = container.resolve<GetExcludedCountriesUseCase>(UC_TOKENS.GetExcludedCountries);
      const countries = await uc.execute(request.params.regionId);
      return reply.send(countries);
    },
  );

  app.get<{ Params: { productId: string }; Querystring: { countryCode: string } }>(
    '/geo/restricted-variants/:productId',
    { schema: { params: { type: 'object', required: ['productId'], properties: { productId: { type: 'string', format: 'uuid' } } }, querystring: geoRestrictedVariantsQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetRestrictedVariantsUseCase>(UC_TOKENS.GetRestrictedVariants);
      const variants = await uc.execute(request.params.productId, request.query.countryCode);
      return reply.send(variants);
    },
  );

  app.get<{ Querystring: { countryCode: string } }>(
    '/geo/restricted-regions',
    { schema: { querystring: geoRestrictedRegionsQuerySchema } },
    async (request, reply) => {
      const uc = container.resolve<GetRestrictedRegionsUseCase>(UC_TOKENS.GetRestrictedRegions);
      const regions = await uc.execute(request.query.countryCode);
      return reply.send(regions);
    },
  );
}
