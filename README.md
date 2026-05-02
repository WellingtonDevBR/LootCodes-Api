# LootCodes API

Fastify **5** API server for LootCodes: hexagonal architecture (ports & adapters), **tsyringe** DI Vitest tests, **zod** config.

## Quick start

```bash
cp .env.example .env   # fill all required keys (see src/config/env.ts)
npm ci
npm run dev            # loads `.env` from project root via dotenv
```

Health: `GET /health`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Watch mode with `tsx` |
| `npm run build` | TypeScript compile (optional Sentry sourcemaps when env set) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |

## Deploy (AWS)

- **Docker:** see `Dockerfile` and `docker-compose.prod.yml` (API on **:3000** host and container).
- **Terraform EC2:** `deploy/terraform/`
- **Step-by-step:** `deploy/EC2.md`

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/backend-ci-cd.yml` — test/lint on PRs; on `main`, build and push to **ECR** and deploy via **SSM** (see workflow header for secrets/variables).

**AWS:** If you use GitHub OIDC, allow this repository on your deploy role trust policy, for example:

`repo:WellingtonDevBR/LootCodes-Api:*`

## Security

Do **not** commit `.env`, `*.pem`, or `deploy/terraform/*.tfstate`. Rotate any key that was ever committed by mistake.
