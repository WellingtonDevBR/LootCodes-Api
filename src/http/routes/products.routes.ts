import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TOKENS } from '../../di/tokens.js';
import type { IProductService } from '../../core/ports/product-service.port.js';
import type { StockCheckItem } from '../../core/services/products/product.types.js';
import { authGuard } from '../middleware/auth.guard.js';
import {
  slugParamsSchema,
  productIdParamsSchema,
  batchStockCheckBodySchema,
  stockNotificationSubscribeBodySchema,
  stockNotificationUnsubscribeBodySchema,
  variantIdParamsSchema,
} from '../schemas/products.schema.js';

interface AuthenticatedRequest {
  authUser: { id: string; email?: string };
}

export async function productRoutes(app: FastifyInstance) {
  const resolveService = () => container.resolve<IProductService>(TOKENS.ProductService);

  app.get<{ Params: { slug: string } }>(
    '/slug/:slug',
    { schema: { params: slugParamsSchema } },
    async (request, reply) => {
      const data = await resolveService().getProductBySlug(request.params.slug);
      return reply.send(data);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const product = await resolveService().getProductById(request.params.id);
      return reply.send(product);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id/variants',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const variants = await resolveService().getVariants(request.params.id);
      return reply.send(variants);
    },
  );

  app.get<{ Params: { id: string } }>(
    '/:id/gallery',
    { schema: { params: productIdParamsSchema } },
    async (request, reply) => {
      const gallery = await resolveService().getGallery(request.params.id);
      return reply.send(gallery);
    },
  );

  app.post<{ Body: { items: StockCheckItem[] } }>(
    '/stock-check',
    { schema: { body: batchStockCheckBodySchema } },
    async (request, reply) => {
      const results = await resolveService().batchCheckStock(request.body.items);
      return reply.send(results);
    },
  );

  app.get('/featured', async (_request, reply) => {
    const featured = await resolveService().getFeatured();
    return reply.send(featured);
  });

  app.get('/platforms', async (_request, reply) => {
    const platforms = await resolveService().getPlatforms();
    return reply.send(platforms);
  });

  app.get('/regions', async (_request, reply) => {
    const regions = await resolveService().getRegions();
    return reply.send(regions);
  });

  app.get('/genres', async (_request, reply) => {
    const genres = await resolveService().getGenres();
    return reply.send(genres);
  });

  app.get('/faqs', async (_request, reply) => {
    const faqs = await resolveService().getFAQs();
    return reply.send(faqs);
  });

  app.post<{ Body: { variant_id: string; email: string } }>(
    '/stock-notifications/subscribe',
    { preHandler: [authGuard], schema: { body: stockNotificationSubscribeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().subscribeStockNotification(
        authUser.id,
        request.body.variant_id,
        request.body.email,
      );
      return reply.code(201).send({ success: true });
    },
  );

  app.delete<{ Body: { variant_id: string } }>(
    '/stock-notifications/unsubscribe',
    { preHandler: [authGuard], schema: { body: stockNotificationUnsubscribeBodySchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      await resolveService().unsubscribeStockNotification(authUser.id, request.body.variant_id);
      return reply.code(204).send();
    },
  );

  app.get<{ Params: { variantId: string } }>(
    '/stock-notifications/check/:variantId',
    { preHandler: [authGuard], schema: { params: variantIdParamsSchema } },
    async (request, reply) => {
      const { authUser } = request as unknown as AuthenticatedRequest;
      const subscribed = await resolveService().isSubscribedToStock(
        authUser.id,
        request.params.variantId,
      );
      return reply.send({ subscribed });
    },
  );
}
