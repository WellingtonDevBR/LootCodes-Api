import * as Sentry from '@sentry/node';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import sensible from '@fastify/sensible';
import { loadEnv } from './config/env.js';
import { buildCorsOrigins, corsOriginValidator } from './config/cors.js';
import { errorHandler } from './http/middleware/error-handler.js';
import { registerIpBlocklistHook } from './http/middleware/ip-blocklist.hook.js';
import { healthRoutes } from './http/routes/health.routes.js';
import { authRoutes } from './http/routes/auth.routes.js';
import { profileRoutes } from './http/routes/profile.routes.js';
import { orderRoutes } from './http/routes/orders.routes.js';
import { checkoutRoutes } from './http/routes/checkout.routes.js';
import { supportRoutes } from './http/routes/support.routes.js';
import { libraryRoutes } from './http/routes/library.routes.js';
import { notificationsRoutes } from './http/routes/notifications.routes.js';
import { reviewRoutes } from './http/routes/reviews.routes.js';
import { productRoutes } from './http/routes/products.routes.js';
import { analyticsRoutes } from './http/routes/analytics.routes.js';
import { walletRoutes } from './http/routes/wallet.routes.js';
import { referralRoutes } from './http/routes/referrals.routes.js';
import { newsletterRoutes } from './http/routes/newsletter.routes.js';
import { securityRoutes } from './http/routes/security.routes.js';
import { cardChallengeRoutes } from './http/routes/card-challenge.routes.js';
import { priceMatchRoutes } from './http/routes/price-match.routes.js';
import { paymentRoutes } from './http/routes/payments.routes.js';
import { webhookRoutes } from './http/routes/webhooks.routes.js';
import { guestRoutes } from './http/routes/guest.routes.js';
import { recommendationsRoutes } from './http/routes/recommendations.routes.js';
import { searchRoutes } from './http/routes/search.routes.js';
import { storefrontRoutes } from './http/routes/storefront.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    trustProxy: true,
    requestTimeout: 30_000,
    bodyLimit: 1_048_576,
  });

  const origins = buildCorsOrigins(env);
  await app.register(cors, {
    origin: corsOriginValidator(origins),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type', 'x-requested-with', 'x-requested-by', 'x-internal-secret', 'x-guest-token', 'stripe-signature'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  await app.register(sensible);

  registerIpBlocklistHook(app);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(profileRoutes, { prefix: '/api/profile' });
  await app.register(orderRoutes, { prefix: '/api/orders' });
  await app.register(checkoutRoutes, { prefix: '/api/checkout' });
  await app.register(supportRoutes, { prefix: '/api/support' });
  await app.register(libraryRoutes, { prefix: '/api/library' });
  await app.register(notificationsRoutes, { prefix: '/api/notifications' });
  await app.register(reviewRoutes, { prefix: '/api/reviews' });
  await app.register(productRoutes, { prefix: '/api/products' });
  await app.register(analyticsRoutes, { prefix: '/api/analytics' });
  await app.register(walletRoutes, { prefix: '/api/wallet' });
  await app.register(referralRoutes, { prefix: '/api/referrals' });
  await app.register(newsletterRoutes, { prefix: '/api/newsletter' });
  await app.register(securityRoutes, { prefix: '/api/security' });
  await app.register(cardChallengeRoutes, { prefix: '/api/card-challenge' });
  await app.register(priceMatchRoutes, { prefix: '/api/price-match' });
  await app.register(paymentRoutes, { prefix: '/api/payments' });
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });
  await app.register(guestRoutes, { prefix: '/api/guest' });
  await app.register(recommendationsRoutes, { prefix: '/api/recommendations' });
  await app.register(searchRoutes, { prefix: '/api/search' });
  await app.register(storefrontRoutes, { prefix: '/api/storefront' });

  Sentry.setupFastifyErrorHandler(app);

  app.setErrorHandler(errorHandler);

  return app;
}
