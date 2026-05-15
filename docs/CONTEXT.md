# x402 Facilitator — Domain Context

## Overview

x402 is a payment facilitation system that bridges browser-based financial applications with blockchain settlement. The system validates cryptographic payment signatures from clients and settles USDC transfers on Base.

## Architecture

**One unified Next.js app (apps/x402)** combining:
1. **Finance frontend** — user accounts, wallets, authentication
2. **Facilitator backend** — payment verification and blockchain settlement
3. **Admin dashboard** — resource server and API key management
4. **Public API** — partner-facing payment endpoints with OpenAPI docs

## Key Concepts

### Resource Servers
External applications that integrate with x402 via API keys. Examples: finance app, third-party services.

### API Keys
Scoped, expiring secrets used by resource servers to authenticate with public endpoints. Stored as bcrypt hashes. Format: `x402_live_` + 128-char random secret.

### Payment Verification
Cryptographic validation of x402 payment signatures from clients. Result cached for 30 days. Idempotency based on payload hash.

### Settlement
Async USDC transfer submission to Base. Returns immediately with settlementId and pending status. Status polled via GET endpoint.

### Organization
Tenant boundary. Resource servers belong to organizations. Dashboard users belong to organizations.

## Routes & APIs

### Public (Requires API Key Auth)
- `POST /api/v2/verify` — validate payment signature
- `POST /api/v2/settle` — submit settlement to blockchain
- `GET /api/v2/status/verification/:verificationId` — check verification status
- `GET /api/v2/status/settlement/:settlementId` — check settlement status

### Admin (Requires Session Auth)
- Resource server CRUD
- API key create/revoke/rotate
- Usage metrics and audit logs

### Public Docs
- `GET /api/v2/openapi.json` — OpenAPI spec (JSON only, no UI for now)
- `GET /docs` — (future: interactive docs)

### Health
- `GET /health` — service health check

## Auth Models

### Public API
- **Bearer token**: API key in Authorization header
- **Scopes** (per key): verify:payment, settle:payment, read:status
- **Idempotency**: Idempotency-Key header required on POST endpoints, scoped by (apiKey, route, body hash), 24h retention

### Admin Dashboard
- **Session auth**: Better-auth, passkey-based
- **Single role**: full access (simplified for v1)
- **Organization boundary**: enforced on all queries

## Database Schema

### Public/Payment Tables
- `facilitator.resource_server` — app registrations with API keys
- `facilitator.api_key` — bcrypt hashes + metadata (scopes, expiresAt, revokedAt, createdBy, lastUsedAt)
- `facilitator.payment_verification` — incoming x402 signatures + status
- `facilitator.settlement` — onchain transactions + confirmation status
- `facilitator.idempotency_response` — stored responses for Idempotency-Key replay

### Admin Tables
- `facilitator.organization` — (single org for v1, foundation for multi-tenant later)
- `facilitator.organization_member` — (single user for v1)

### Existing Tables (From apps/finance)
- `public.user` — browser users
- `public.wallet` — EVM addresses (Circle integration)
- Session, account, passkey tables (managed by better-auth)

## Rate Limits (Per API Key)

- verify: 60 req/min
- settle: 30 req/min
- status: 120 req/min
- Burst: token-bucket with short allowance
- Enforcement: 429 with Retry-After header

## Error Handling

**Unified error envelope** (public and admin):
```json
{
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Payment signature verification failed",
    "details": "Optional diagnostic info"
  },
  "requestId": "req_123abc",
  "timestamp": 1234567890
}
```

**Status codes**:
- 202 Accepted — settlement enqueued
- 200 OK — success
- 400 Bad Request — validation
- 401 Unauthorized — auth failure
- 403 Forbidden — permission denied
- 404 Not Found — resource not found
- 409 Conflict — idempotency conflict
- 429 Too Many Requests — rate limited
- 500 Internal Server Error — unhandled exception

## Naming & Conventions

- App folder: `apps/x402`
- Package name: `x402`
- Dev script: `dev:x402` → `turbo -F x402 dev`
- API versioning: `/api/v2/` for partners, `/api/admin/` for internal
- Handlers: in `app/api/` with route grouping for clarity

## OpenAPI & Docs

- **Source of truth**: Generated from oRPC routers
- **Spec path**: `/api/v2/openapi.json` (JSON only, no UI)
- **Artifact**: `openapi-public-v1.json` (build output for CI/SDK generation)
- **Admin spec**: Not exposed publicly

## Acceptance Gate (Before Delete)

✅ Build passes (`bun run build`)  
✅ Types pass (`bun run ts`)  
✅ Migrations apply (`bun run db:push`)  
✅ Public v1 endpoints functional (verify, settle, status)  
✅ Admin key flows functional (create, rotate, revoke)  
✅ OpenAPI generation succeeds and spec validates  
✅ Integration tests pass  
✅ Idempotency enforcement verified  
✅ Rate limiting enforced

Only after all ✅ are green: delete `apps/facilitator` and `apps/finance`, finalize single commit.

## Related Documents

- `docs/adr/MERGE_APP_DESIGN.md` — 25 design decisions with rationale
- `IMPLEMENTATION_PLAN.md` — step-by-step build instructions
- `DATABASE_MIGRATION_SPEC.md` — exact schema additions
