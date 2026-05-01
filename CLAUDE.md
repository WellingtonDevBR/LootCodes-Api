# Backend Development Guidelines

Standalone Fastify API server. Hexagonal architecture with SOLID principles. This backend is designed to be **vendor-agnostic** — Supabase is an infrastructure adapter, not a core dependency. Swap any provider by writing a new adapter that implements the same port interface.

## Quick Reference

- **Runtime**: Node.js 22 LTS with TypeScript
- **Framework**: Fastify 5
- **DI**: tsyringe (constructor injection via decorators)
- **Testing**: Vitest
- **Logging**: pino (Fastify built-in) + `shared/logger.ts`
- **Validation**: zod (env config) + Fastify JSON schemas (requests)
- **Error tracking**: Sentry (`@sentry/node` + `@sentry/profiling-node`)
- **Security headers**: `@fastify/helmet`
- **Rate limiting**: `@fastify/rate-limit` (HTTP layer) + `IRateLimiter` (DB-backed)
- **File uploads**: `@fastify/multipart`
- **Search**: Algolia via `ISearchProvider` abstraction (optional)
- **Package manager**: npm

## Architecture Layers

```
core/          Domain logic — ZERO external dependencies
  use-cases/   Application logic — one class per business operation
    _shared/   Cross-domain helpers (e.g. checkout-security.ts)
    {domain}/  Use cases + co-located types per domain
  ports/       Interface definitions (contracts for repositories, providers, adapters)
  entities/    Plain data types
  errors/      Domain error classes

infra/         Adapter implementations — external SDKs live here
  database/    Supabase DB adapter (implements IDatabase)
  auth/        Supabase Auth adapter (implements IAuthProvider)
  email/       Resend adapter (implements IEmailSender)
  recaptcha/   reCAPTCHA Enterprise adapter
  user/        Supabase user repository (implements IUserRepository)
  security/    Supabase rate limiter + IP blocklist adapters
  event-bus/   In-process event bus
  profile/     User profile, avatar storage, session repository
  orders/      Order, product key, access token repositories
  payments/    Stripe payment gateway + provider
  checkout/    Checkout repository, promo code, cart validator
  support/     Support ticket repository, attachment storage
  library/     User library repository
  notifications/ Notification, preferences, push token repositories
  reviews/     Review repository
  products/    Product, category, pricing, geo restriction, recommendation, reference data repositories
  analytics/   Analytics repository, geo service
  search/      Algolia search adapter

http/          Transport — Fastify routes, middleware, schemas
  routes/      Route definitions grouped by domain
  middleware/  Auth guards, rate limiting, error handler
  schemas/     Fastify JSON schema definitions

shared/        Pure utility modules (no external deps)
config/        Environment loading (zod-validated)
di/            Composition root — wires ports to adapters
```

### Dependency Rules

- `core/` imports ONLY from `core/`, `shared/`, and `tsyringe` (DI decorators: `@injectable`, `@inject`). Never from `infra/`, `http/`, or `config/`.
- `infra/` imports from `core/ports/` (to implement), `core/use-cases/*/*.types.js` (`import type` only — DTOs), `core/errors/` (to throw domain errors), `config/` (for env), and `shared/`.
- `http/` imports from `core/use-cases/` (use case classes for DI resolution), `core/use-cases/*/*.types.js` (`import type` only — DTOs/request shapes), `core/errors/`, and `shared/`.
- `di/` imports everything (it is the composition root).
- `shared/` imports nothing except Node.js built-ins.

## Use Cases and Dependency Inversion

Every business operation is a single use-case class with one `execute()` method. Use cases depend on port interfaces (repositories, providers, adapters), never on implementations.

### How it works

```
┌─────────────────────────────────────────────────┐
│  core/use-cases/auth/handle-auth.use-case.ts    │
│                                                 │
│  @injectable()                                   │
│  class HandleAuthUseCase {                       │
│    constructor(                                   │
│      @inject(TOKENS.AuthProvider) auth,           │
│      @inject(TOKENS.UserRepository) userRepo,     │
│      @inject(TOKENS.RateLimiter) rateLimiter,     │
│      @inject(TOKENS.IpBlocklist) ipBlocklist,     │
│      @inject(TOKENS.RecaptchaVerifier) captcha,   │
│    )                                              │
│    async execute(dto, ctx) { ... }               │
│  }                                               │
│  Knows NOTHING about Supabase, Resend, Redis.    │
└─────────────┬───────────────────────────────────┘
              │ injected via TOKENS + UC_TOKENS
              ▼
┌─────────────────────────────────────────────────┐
│  di/container.ts (composition root)             │
│                                                 │
│  TOKENS.AuthProvider  → SupabaseAuthAdapter      │
│  UC_TOKENS.HandleAuth → HandleAuthUseCase        │
│                                                 │
│  Change one line to swap any provider.           │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  infra/ — Vendor-specific adapters               │
│  Each implements a port interface.               │
└─────────────────────────────────────────────────┘
```

### Port registry

See `.cursor/rules/backend.mdc` for the full port registry (infrastructure adapters) and use case registry (application logic). Use cases inject port interfaces via `TOKENS`; routes resolve use cases via `UC_TOKENS`.

Infrastructure ports (TOKENS): `IDatabase`, `IEmailSender`, `IEventBus`, `IAuthProvider`, `IUserRepository`, `IRateLimiter`, `IIpBlocklist`, `IRecaptchaVerifier`, `IUserProfileRepository`, `IAvatarStorage`, `ISessionRepository`, `IOrderRepository`, `IProductKeyRepository`, `IOrderAccessTokenRepository`, `IPaymentGateway`, `IPaymentProvider`, `ICheckoutRepository`, `IPromoCodeValidator`, `ICartValidator`, `ISupportTicketRepository`, `IAttachmentStorage`, `IUserLibraryRepository`, `INotificationRepository`, `INotificationPreferencesRepository`, `IPushTokenRepository`, `IReviewRepository`, `IProductRepository`, `IReferenceDataRepository`, `ICategoryRepository`, `IPricingRepository`, `IGeoRestrictionRepository`, `IStockNotificationRepository`, `IRecommendationRepository`, `ISearchProvider`, `IAnalyticsRepository`, `IGeoService`, `IWalletRepository`, `IReferralRepository`, `INewsletterRepository`, `ISecurityHoldRepository`, `IVerificationStorage`, `ICardChallengeRepository`, `IMicroAuthProvider`, `IPriceMatchRepository`, `IPaymentVerifier`, `IRiskAssessor`, `IFulfillmentService`, `IPaymentCapturer`, `IWebhookVerifier`, `IWebhookHandler`, `IGuestSessionRepository`

### Swapping a provider (example: Supabase Auth → custom JWT)

1. Create `infra/auth/custom-jwt-auth.adapter.ts`:
   ```typescript
   @injectable()
   export class CustomJwtAuthAdapter implements IAuthProvider {
     async signInWithPassword(email: string, password: string): Promise<SignInResult> {
       // bcrypt verify, issue JWT, etc.
     }
     // ... implement remaining IAuthProvider methods
   }
   ```
2. Update `di/container.ts`:
   ```typescript
   container.register(TOKENS.AuthProvider, { useClass: CustomJwtAuthAdapter });
   ```
3. Done. Zero changes in `core/` or `http/`.

### Key constraint: `IDatabase` is infra-only

`IDatabase` provides generic `query()`, `insert()`, `rpc()` etc. It is a building block for **infra adapters**, not for use cases. Use cases depend on domain-specific ports:

| Instead of (WRONG) | Use (CORRECT) |
|---|---|
| `db.rpc('get_auth_user_id_by_email', ...)` | `userRepo.findIdByEmail(email)` |
| `db.rpc('is_ip_blocked', ...)` | `ipBlocklist.isBlocked(ip)` |
| `db.rpc('check_rate_limit', ...)` | `rateLimiter.check({ ... })` |
| `db.rpc('get_security_config', ...)` | `rateLimiter.getConfig(key)` |

This keeps vendor-specific names (`p_email`, `p_ip_address`, RPC function names) confined to adapters.

## Security Checklist (2026 Best Practices)

### Authentication & Authorization
- [ ] All protected routes use `authGuard` preHandler
- [ ] Guest routes use HttpOnly `guest_session` cookie (never raw tokens)
- [ ] JWT verified on every request (no caching user sessions)
- [ ] User-scoped queries always filter by authenticated `userId`

### Input Validation
- [ ] Every route has a Fastify JSON schema for params, querystring, and body
- [ ] UUIDs validated with `format: 'uuid'`
- [ ] String lengths capped with `maxLength`
- [ ] `additionalProperties: false` on body schemas
- [ ] File uploads validate MIME type and size

### Rate Limiting
- [x] Global HTTP rate limit: 100 req/min (`@fastify/rate-limit`)
- [x] Auth endpoints: 10 req/min per IP (`createRateLimitGuard`, `failClosed`)
- [x] Checkout: 20 req/min per IP
- [x] Payment verify/capture: 10 req/min per IP (`failClosed`)
- [ ] DB-backed rate limiter (`IRateLimiter`) for per-user/per-email limits

### IP & Client Validation
- [x] IP blocklist hook (`ip-blocklist.hook.ts`) checks every request at the `onRequest` lifecycle (before auth/route). Exempt: `/health`, `/api/webhooks`
- [x] `X-Requested-By` guard (`requested-by.guard.ts`) validates `lootcodes-web` or `lootcodes-app` client identity. Apply as `preHandler` where needed.

### HTTP Security Headers
- [x] `@fastify/helmet` registered (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [x] CSP delegated to reverse proxy/CDN
- [x] CORS restricted to production origins (no wildcard)

### Error Handling
- [ ] Domain errors mapped to HTTP codes in `error-handler.ts`
- [ ] No internal stack traces in production responses
- [ ] Sentry captures all unhandled errors

### Secrets Management
- [ ] All secrets via environment variables
- [ ] `.env` never committed (`.env.example` documents vars)
- [ ] Optional services (Sentry, Algolia) degrade gracefully when keys missing
- [ ] `INTERNAL_SERVICE_SECRET` rotated via `INTERNAL_SERVICE_SECRET_PREVIOUS`

### Dependency Security
- [ ] `npm audit` run in CI
- [ ] No `@latest` pins — lockfile committed
- [ ] Dockerfile uses `node:22-alpine` with `USER node`

### Logging & Monitoring
- [ ] Structured JSON logs via pino (Fastify built-in)
- [ ] Request ID in every log entry
- [ ] Sentry for error tracking with PII scrubbing
- [ ] No PII in logs (emails masked, IPs redacted in Sentry)

## Sentry Integration

### Setup
- `instrument.ts` is loaded via `--import` flag before the application starts.
- It initializes `@sentry/node` with DSN, environment, release, sampling rates.
- `nodeProfilingIntegration()` from `@sentry/profiling-node` provides CPU profiling.
- `nodeRuntimeMetricsIntegration()` provides V8 heap/GC metrics.

### PII Scrubbing
The `beforeSend` hook removes:
- `request.cookies` — all cookies stripped
- `request.headers` — Authorization, Cookie, x-internal-secret, x-guest-token, stripe-signature
- `request.query_string` — removed entirely
- `event.user.ip_address` and `event.user.email` — removed
- Sensitive URL params (token, email, key, session, password, secret, api_key) → `[Filtered]`

### Error Handler Integration
```
Routes registered → Sentry.setupFastifyErrorHandler(app) → app.setErrorHandler(errorHandler)
```
Sentry captures errors BEFORE the custom error handler formats them for the client.

### Graceful Shutdown
`SIGTERM`/`SIGINT` handlers call `Sentry.close(2000)` to flush buffered events before process exit.

### Build & Deploy
```bash
npm run build   # tsc + sentry-cli sourcemaps inject + upload
npm run start   # node --import ./dist/instrument.js dist/server.js
```

## How to Add a New Domain

1. **Types**: Create `core/use-cases/{domain}/{domain}.types.ts` with request/response DTOs.
2. **Domain ports**: Create domain-specific ports (`core/ports/{domain}-repository.port.ts`). Do NOT use `IDatabase` directly.
3. **Use cases**: Create individual use-case files in `core/use-cases/{domain}/`. Each class has `@injectable()`, injects ports via constructor, and has one `execute()` method. File naming: `{verb}-{noun}.use-case.ts`.
4. **Adapters**: Create `infra/{domain}/supabase-{domain}.repository.ts` implementing the port. The adapter CAN use `IDatabase` internally.
5. **DI tokens**: Add port tokens to `TOKENS` and use-case tokens to `UC_TOKENS` in `di/tokens.ts`. Register both in `di/container.ts`.
6. **Routes**: Create `http/routes/{domain}.routes.ts`. Resolve use cases via `container.resolve<XxxUseCase>(UC_TOKENS.Xxx)`. Register as Fastify plugin in `app.ts`.
7. **Schemas**: Define request/response JSON schemas in `http/schemas/{domain}.schema.ts`.
8. **Mocks**: Add mock implementations to `test/helpers/mock-ports.ts`.
9. **Tests**: Unit test each use case in `test/unit/core/use-cases/{domain}/`. Integration test routes in `test/integration/routes/`.

## How to Add a New Port + Adapter

1. Define the port interface in `core/ports/{name}.port.ts` — methods describe *what* (`findByEmail`), not *how* (`supabaseRpcGetUser`).
2. Create `infra/{category}/{provider}-{name}.adapter.ts` implementing the port.
3. Decorate the class with `@injectable()`.
4. Add a token to `di/tokens.ts`.
5. Register in `di/container.ts`: `container.register(TOKENS.Xxx, { useClass: XxxAdapter })`.
6. Add a mock to `test/helpers/mock-ports.ts`.
7. Register the mock in `test/helpers/test-app.ts`.

## Porting from Edge Functions

When migrating a Supabase Edge Function to this backend:

1. Replace `Deno.env.get(...)` with injected config or `env` import from `config/env`.
2. Replace `Deno.serve` / Deno HTTP types with Fastify route handlers.
3. Replace `getServiceRoleClient()` / `getAnonClientWithAuth()` — create domain-specific ports for what the function actually does. Do NOT use `IDatabase.rpc()` in services.
4. Replace `getCorsHeaders(req)` — Fastify `@fastify/cors` handles this globally.
5. Replace `new Response(JSON.stringify(...))` with `reply.code(xxx).send(data)`.
6. Replace `crypto.randomUUID()` with Node.js `crypto.randomUUID()`.
7. Move shared logic from `_shared/` to `shared/` (if not already ported).
8. Keep the same business logic — port, don't rewrite.

## DI Tokens

All DI tokens are in `di/tokens.ts`. Two token objects:
- `TOKENS` — infrastructure ports (repositories, providers, adapters)
- `UC_TOKENS` — use cases (application logic)

Usage in a use case:

```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../di/tokens.js';
import type { IOrderRepository } from '../../ports/order-repository.port.js';

@injectable()
export class GetOrderUseCase {
  constructor(
    @inject(TOKENS.OrderRepository) private orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string, userId: string) {
    return this.orderRepo.getOrder(orderId, userId);
  }
}
```

Usage in a route handler:

```typescript
import { UC_TOKENS } from '../../di/tokens.js';
import type { GetOrderUseCase } from '../../core/use-cases/orders/get-order.use-case.js';

const uc = container.resolve<GetOrderUseCase>(UC_TOKENS.GetOrder);
const order = await uc.execute(orderId, userId);
```

## Testing Patterns

**Unit tests** — mock only the ports each use case needs:
```typescript
import { setupTestContainer } from '../../helpers/test-app';

const mocks = setupTestContainer();
mocks.userRepo.setUser('test@example.com', 'user-1');
mocks.rateLimiter.shouldAllow = true;

const handleAuth = container.resolve<HandleAuthUseCase>(UC_TOKENS.HandleAuth);
const result = await handleAuth.execute(dto, ctx);
```

**Integration tests** — use Fastify inject:
```typescript
import { buildTestApp } from '../../helpers/test-app';

const { app, mocks } = await buildTestApp();
mocks.userRepo.setUser('test@example.com', 'user-1');

const res = await app.inject({ method: 'POST', url: '/api/auth/sign-in', payload: {...} });
expect(res.statusCode).toBe(200);
```

## Environment Variables

All env vars are validated at startup in `config/env.ts`. The app crashes immediately if required vars are missing — no silent fallback for secrets.

Required:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- `INTERNAL_SERVICE_SECRET`
- `RECAPTCHA_PROJECT_ID`, `RECAPTCHA_SITE_KEY`, `RECAPTCHA_API_KEY`
- `RESEND_API_KEY`

Optional (features degrade gracefully):
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` — error tracking
- `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_KEY` — search proxy
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` — build-time sourcemap upload

## Docker

- `Dockerfile` — multi-stage build (builder + minimal `node:22-alpine` runtime)
- `docker-compose.yml` — local dev with Postgres
- Final image: non-root `node` user, no `.env`, only dist + node_modules + package.json
- Health check: `GET /health`
- Target: EC2 deployment (future)

## Conventions

- Prices: cents (integer). `2999` = $29.99.
- IDs: UUID v4. Validate with zod `z.string().uuid()` or Fastify `format: 'uuid'`.
- Timestamps: ISO 8601 strings.
- Currency codes: 3-letter ISO 4217 (e.g., `USD`, `EUR`, `BRL`).
- Country codes: 2-letter ISO 3166-1 alpha-2 (e.g., `US`, `BR`, `DE`).
- Errors: domain errors mapped to HTTP by the global error handler.
- Logging: structured JSON via pino. Always include `requestId`.
- FORBIDDEN: `console.log` — use `createLogger` from `shared/logger.ts`.
- FORBIDDEN: `any` types — use `unknown` and narrow.
- FORBIDDEN: imports inside functions — all imports at file top.
