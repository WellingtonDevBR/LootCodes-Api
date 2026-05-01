# Backend Development Guidelines

Standalone Fastify API server. Hexagonal architecture with SOLID principles. This backend is designed to be **vendor-agnostic** — Supabase is an infrastructure adapter, not a core dependency. Swap any provider by writing a new adapter that implements the same port interface.

## Quick Reference

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify 5
- **DI**: tsyringe (constructor injection via decorators)
- **Testing**: Vitest
- **Logging**: pino (Fastify built-in) + `@shared/logger.ts`
- **Validation**: zod (env config) + Fastify JSON schemas (requests)
- **Package manager**: npm

## Architecture Layers

```
core/          Domain logic — ZERO external dependencies
  ports/       Interface definitions (contracts)
  services/    Business logic grouped by domain (auth/, checkout/, etc.)
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
  payments/    Stripe payment gateway + provider (stubs)
  checkout/    Checkout repository, promo code, cart validator
  support/     Support ticket repository, attachment storage
  library/     User library repository
  notifications/ Notification, preferences, push token repositories
  reviews/     Review repository
  products/    Product, reference data, stock notification repositories
  analytics/   Analytics repository, geo service

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
- `infra/` imports from `core/ports/` (to implement), `core/errors/` (to throw domain errors), `config/` (for env), and `shared/`.
- `http/` imports from `core/ports/` (interface types for DI resolution), `core/services/*/*.types.js` (`import type` only — DTOs/request shapes), `core/errors/`, and `shared/`.
- `di/` imports everything (it is the composition root).
- `shared/` imports nothing except Node.js built-ins.

## Ports and Adapters (Dependency Inversion)

This is the architectural backbone. Every external capability is abstracted behind a port interface. Services depend on ports, never on implementations.

### How it works

```
┌─────────────────────────────────────────────────┐
│  core/services/auth/auth.service.ts             │
│                                                 │
│  Depends on:                                    │
│    IAuthProvider   (sign-in, sign-up, OTP)      │
│    IUserRepository (find user by email)         │
│    IRateLimiter    (check rate limits)           │
│    IIpBlocklist    (check blocked IPs)           │
│    IRecaptchaVerifier (CAPTCHA assessment)       │
│                                                 │
│  Knows NOTHING about Supabase, Resend, Redis,   │
│  Postgres, DynamoDB, or any vendor.              │
└─────────────┬───────────────────────────────────┘
              │ injected via TOKENS at runtime
              ▼
┌─────────────────────────────────────────────────┐
│  di/container.ts (composition root)             │
│                                                 │
│  TOKENS.AuthProvider  → SupabaseAuthAdapter      │
│  TOKENS.UserRepository → SupabaseUserRepository  │
│  TOKENS.RateLimiter   → SupabaseRateLimiterAdapter│
│  TOKENS.IpBlocklist   → SupabaseIpBlocklistAdapter│
│  TOKENS.RecaptchaVerifier → RecaptchaAdapter      │
│                                                 │
│  Change one line here to swap any provider.      │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  infra/auth/supabase-auth.adapter.ts            │
│  infra/user/supabase-user.repository.ts         │
│  infra/security/supabase-rate-limiter.adapter.ts│
│  infra/security/supabase-ip-blocklist.adapter.ts│
│  infra/recaptcha/recaptcha.adapter.ts           │
│                                                 │
│  Vendor-specific code lives ONLY here.           │
│  Each implements a port interface.               │
└─────────────────────────────────────────────────┘
```

### Port registry

See `.cursor/rules/backend.mdc` for the full port registry table organized by domain. Summary by domain:

- **Infrastructure**: `IDatabase`, `IEmailSender`, `IEventBus`
- **Auth**: `IAuthProvider`, `IUserRepository`, `IRateLimiter`, `IIpBlocklist`, `IRecaptchaVerifier`, `IAuthService`
- **Profile**: `IUserProfileRepository`, `IAvatarStorage`, `ISessionRepository`, `IProfileService`
- **Orders**: `IOrderRepository`, `IProductKeyRepository`, `IOrderAccessTokenRepository`, `IPaymentGateway`, `IOrderService`, `IKeyDeliveryService`
- **Checkout**: `IPaymentProvider`, `ICheckoutRepository`, `IPromoCodeValidator`, `ICartValidator`, `ICheckoutService`
- **Support**: `ISupportTicketRepository`, `IAttachmentStorage`, `ISupportService`
- **Library**: `IUserLibraryRepository`, `ILibraryService`
- **Notifications**: `INotificationRepository`, `INotificationPreferencesRepository`, `IPushTokenRepository`, `INotificationService`
- **Reviews**: `IReviewRepository`, `IReviewService`
- **Products**: `IProductRepository`, `IReferenceDataRepository`, `IStockNotificationRepository`, `IProductService`
- **Analytics**: `IAnalyticsRepository`, `IGeoService`, `IAnalyticsService`

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

`IDatabase` provides generic `query()`, `insert()`, `rpc()` etc. It is a building block for **infra adapters**, not for services. Services use domain-specific ports:

| Instead of (WRONG) | Use (CORRECT) |
|---|---|
| `db.rpc('get_auth_user_id_by_email', ...)` | `userRepo.findIdByEmail(email)` |
| `db.rpc('is_ip_blocked', ...)` | `ipBlocklist.isBlocked(ip)` |
| `db.rpc('check_rate_limit', ...)` | `rateLimiter.check({ ... })` |
| `db.rpc('get_security_config', ...)` | `rateLimiter.getConfig(key)` |

This keeps vendor-specific names (`p_email`, `p_ip_address`, RPC function names) confined to adapters.

## How to Add a New Domain

1. **Types**: Create `core/services/{domain}/{domain}.types.ts` with request/response DTOs.
2. **Service port**: Create `core/ports/{domain}-service.port.ts` → `export interface I{Domain}Service { ... }`.
3. **Service**: Create `core/services/{domain}/{domain}.service.ts`. Inject ports via constructor. Decorate with `@injectable()`. Implement the service port.
4. **Domain ports**: If the service needs data, create domain-specific ports (`core/ports/{domain}-repository.port.ts`). Do NOT use `IDatabase` directly.
5. **Adapters**: Create `infra/{domain}/supabase-{domain}.repository.ts` implementing the port. The adapter CAN use `IDatabase` internally.
6. **DI tokens**: Add tokens to `di/tokens.ts`, register in `di/container.ts`.
7. **Routes**: Create `http/routes/{domain}.routes.ts`. Register as a Fastify plugin in `app.ts`.
8. **Schemas**: Define request/response JSON schemas in `http/schemas/{domain}.schema.ts`.
9. **Mocks**: Add mock implementations to `test/helpers/mock-ports.ts`.
10. **Tests**: Unit test the service in `test/unit/core/services/{domain}/`. Integration test routes in `test/integration/routes/`.

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

1. Replace `Deno.env.get(...)` with injected config or `env` import from `@config/env`.
2. Replace `Deno.serve` / Deno HTTP types with Fastify route handlers.
3. Replace `getServiceRoleClient()` / `getAnonClientWithAuth()` — create domain-specific ports for what the function actually does. Do NOT use `IDatabase.rpc()` in services.
4. Replace `getCorsHeaders(req)` — Fastify `@fastify/cors` handles this globally.
5. Replace `new Response(JSON.stringify(...))` with `reply.code(xxx).send(data)`.
6. Replace `crypto.randomUUID()` with Node.js `crypto.randomUUID()`.
7. Move shared logic from `_shared/` to `shared/` (if not already ported).
8. Keep the same business logic — port, don't rewrite.

## DI Tokens

All DI tokens are in `di/tokens.ts`. Usage in a service:

```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@di/tokens';
import type { IUserRepository } from '@core/ports/user-repository.port';
import type { IRateLimiter } from '@core/ports/rate-limiter.port';

@injectable()
export class OrderService implements IOrderService {
  constructor(
    @inject(TOKENS.UserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.RateLimiter) private rateLimiter: IRateLimiter,
  ) {}
}
```

Usage in a route handler:

```typescript
const orderService = container.resolve<IOrderService>(TOKENS.OrderService);
```

## Testing Patterns

**Unit tests** — mock all ports via domain-specific mocks:
```typescript
import { setupTestContainer } from '../../helpers/test-app';

const mocks = setupTestContainer();
mocks.userRepo.setUser('test@example.com', 'user-1');
mocks.rateLimiter.shouldAllow = true;
mocks.ipBlocklist.block('1.2.3.4');

const service = container.resolve(AuthService);
const result = await service.handleAuth(dto, ctx);
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

See `.env.example` for the full list.

## Docker

- `Dockerfile` — multi-stage build (builder + minimal runtime)
- `docker-compose.yml` — local dev with Postgres
- Target: EC2 deployment (future)

## Conventions

- Prices: cents (integer). `2999` = $29.99.
- IDs: UUID v4. Validate with zod `z.string().uuid()`.
- Timestamps: ISO 8601 strings.
- Errors: domain errors mapped to HTTP by the global error handler.
- Logging: structured JSON via pino. Always include `requestId`.
