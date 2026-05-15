# File Structure Reference: apps/x402 Layout

This document maps out the exact file structure the implementation agent should create when building apps/x402. Use this as a visual checklist.

## Directory Tree

```
apps/x402/
├── app/
│   ├── api/
│   │   ├── middleware/
│   │   │   ├── api-key-auth.ts          [NEW] API key validation
│   │   │   ├── idempotency.ts           [NEW] Idempotency-Key enforcement
│   │   │   └── rate-limit.ts            [NEW] Token-bucket rate limiting
│   │   ├── routers/
│   │   │   ├── procedures.ts            [NEW] oRPC procedure builders
│   │   │   ├── public.ts                [NEW] Public v1 endpoints
│   │   │   └── admin.ts                 [NEW] Admin endpoints
│   │   ├── route.ts                     [NEW] Main handler for /api/*
│   │   └── [[...rest]]/route.ts         [EXISTING or UPDATE] Wildcard catch-all
│   ├── docs/
│   │   └── route.ts                     [NEW] Docs redirect/serve
│   ├── layout.tsx                       [KEEP from finance] Root layout
│   ├── page.tsx                         [KEEP from finance] Homepage
│   ├── manifest.ts                      [KEEP from finance] PWA manifest
│   ├── login/
│   │   └── page.tsx                     [KEEP from finance] Login page
│   ├── signup/
│   │   └── page.tsx                     [KEEP from finance] Signup page
│   ├── verify-email/
│   │   └── page.tsx                     [KEEP from finance] Email verification
│   └── [other existing routes]          [KEEP] All finance routes intact
├── components/                          [KEEP from finance] Existing components
├── lib/                                 [KEEP from finance]
├── providers/                           [KEEP from finance]
├── public/                              [KEEP from finance]
├── utils/
│   ├── orpc.ts                          [KEEP from finance] if exists
│   ├── orpc.server.ts                   [KEEP from finance] if exists
│   └── facilitator.ts                   [NEW] Public facilitator helpers
├── scripts/
│   ├── seed-x402-org.ts                 [NEW] Seed default org
│   └── [existing scripts]               [KEEP]
├── __tests__/
│   ├── public-api.test.ts               [NEW] Integration tests
│   └── contract.test.ts                 [NEW] OpenAPI contract tests
├── package.json                         [UPDATE] name: "x402", scripts
├── next.config.ts                       [KEEP or UPDATE] No breaking changes
├── tsconfig.json                        [KEEP from finance]
├── index.css                            [KEEP from finance]
├── postcss.config.mjs                   [KEEP from finance]
└── .env.example                         [UPDATE] x402-specific vars

packages/
├── db/
│   ├── migrations/
│   │   └── TIMESTAMP_add_x402_multi_tenant_foundation.sql  [NEW]
│   ├── schema.ts                        [UPDATE] Add new tables (org, member, etc.)
│   ├── schema-x402-extensions.ts        [NEW] (optional) Separate x402 schema defs
│   └── drizzle.config.ts                [KEEP] No changes needed
├── auth/
│   ├── auth-server.ts                   [KEEP] Use existing
│   └── auth-client.ts                   [KEEP] Use existing
├── api/
│   ├── routers/
│   │   └── index.ts                     [EXISTING] Keep for now, apps/x402 routes separate
│   ├── context.ts                       [KEEP] Reuse if possible
│   └── index.ts                         [KEEP]
├── env/
│   ├── finance.ts                       [KEEP] Existing env schema
│   └── x402.ts                          [NEW] x402-specific env schema
├── shared/
│   └── [existing utilities]             [KEEP] Reuse constants, types
└── facilitator/ (optional internal package)
    ├── verify.ts                        [NEW or MOVE] Verification logic
    ├── settle.ts                        [NEW or MOVE] Settlement logic
    ├── types.ts                         [NEW or MOVE] Shared types
    └── package.json                     [NEW if package]

root/
├── apps/
│   ├── x402/                            [NEW] Unified merged app ← CORE OF WORK
│   ├── facilitator/                     [DELETE at end] Mark deprecated
│   └── finance/                         [DELETE at end] Mark deprecated
├── packages/
│   ├── db/                              [EXTEND] Add migrations
│   ├── facilitator/                     [NEW optional] If moving logic here
│   └── [others]
├── docs/
│   ├── CONTEXT.md                       [NEW] Domain model
│   └── adr/
│       └── MERGE_APP_DESIGN.md          [NEW] 25 decisions
├── IMPLEMENTATION_PLAN.md               [NEW] Step-by-step guide
├── DATABASE_MIGRATION_SPEC.md           [NEW] Schema changes
├── FILE_STRUCTURE_REFERENCE.md          [THIS FILE]
├── turbo.json                           [UPDATE] Add x402 app, rename finance script
├── package.json                         [UPDATE] Rename dev:finance → dev:x402
└── [others]
```

## Critical Pathways

### Public API Surface

Must exist and be wired:
```
POST  /api/v2/verify
POST  /api/v2/settle
GET   /api/v2/status/verification/:verificationId
GET   /api/v2/status/settlement/:settlementId
GET   /api/v2/openapi.json
```

### Admin API Surface

Must exist (internal only):
```
POST  /api/admin/api-keys/create
POST  /api/admin/api-keys/:keyId/revoke
POST  /api/admin/api-keys/:keyId/rotate
GET   /api/admin/api-keys
POST  /api/admin/resource-servers
GET   /api/admin/resource-servers
```

### Docs Surface

```
GET   /docs                   (redirect or simple JSON viewer)
GET   /api/v2/openapi.json  (canonical spec)
```

### Health Check

```
GET   /health
```

## Files to Keep Intact from apps/finance

✅ Authentication pages (login, signup, verify-email, etc.)  
✅ Components directory (all React components)  
✅ Providers (app-state, auth providers)  
✅ Public assets  
✅ Styling (index.css, postcss.config)  
✅ Next.js config patterns  
✅ Package dependencies (React, Next, better-auth, etc.)

## Files to Create New (oRPC/x402-specific)

✅ `app/api/middleware/` — auth, idempotency, rate limiting  
✅ `app/api/routers/` — oRPC public and admin routers  
✅ `app/api/route.ts` — main handler wiring  
✅ Database migrations in `packages/db/migrations/`  
✅ Test files (`__tests__/public-api.test.ts`, `contract.test.ts`)  

## Files to Update

**turbo.json**:
```json
{
  "tasks": {
    "dev:x402": { ... },  // Add or rename from dev:finance
    "dev:finance": { ... }  // Keep as alias temporarily
  }
}
```

**root package.json**:
```json
{
  "scripts": {
    "dev:x402": "turbo -F x402 dev",
    "dev:finance": "turbo -F x402 dev"  // Temporary alias
  }
}
```

**apps/x402/package.json**:
```json
{
  "name": "x402",
  "scripts": {
    "dev": "portless x402 next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  }
}
```

**packages/db/schema.ts**:
Add:
- `organization` table
- `organizationMember` table
- `idempotencyResponse` table
- `apiAuditLog` table (optional)
- Update `apiKey` with columns: scopes, createdBy, expiresAt, revokedAt, keyPrefix
- Update `resourceServer` with organizationId

## Pre-Existing Code to Adapt

### From apps/facilitator/src/verification.ts
- `verifyPayment()` function
- `getVerificationStatus()` function
- Verification types

**Action**: Copy logic, adapt to work within Next handlers (remove Hono middleware).

### From apps/facilitator/src/settlement.ts
- `settlePayment()` function
- `getSettlementStatus()` function
- Viem wallet client setup
- Settlement types

**Action**: Copy logic, adapt to work within Next handlers.

### From apps/facilitator/src/auth.ts
- `authMiddleware()` logic for API key validation
- `getFacilitatorContext()` pattern

**Action**: Refactor into `app/api/middleware/api-key-auth.ts` for Next.js request/response context.

### From apps/finance/app/rpc/[[...rest]]/route.ts
- oRPC/OpenAPI handler pattern
- Context creation

**Action**: Extend to wire both public and admin routers.

## Naming Conventions in Code

Use these exact prefixes/names everywhere:
- API routes: `/api/v2/` for public, `/api/admin/` for admin
- oRPC router variables: `publicRouter`, `adminRouter`
- Middleware functions: `verifyApiKey()`, `checkIdempotency()`, `checkRateLimit()`
- Database queries: prefix org-boundary checks with `organizationId` filter
- Environment variables: `FACILITATOR_*`, `X402_*`
- Error codes: `VERIFICATION_FAILED`, `SETTLEMENT_FAILED`, `RATE_LIMITED`, etc.

## Testing Checkpoints

After creating each section, verify:

1. **After oRPC routers**: `bun run ts` passes, no type errors
2. **After handlers**: `bun run build` succeeds
3. **After migrations**: `bun run db:push` applies cleanly
4. **After complete app**: `bun run dev:x402` starts without errors
5. **After integration tests**: All tests pass
6. **Before deletion**: Acceptance gate fully green

## Deletion Checkpoint

Only delete old apps after:
- [ ] All acceptance gate checks pass
- [ ] All file cross-references updated
- [ ] Final `bun run ts && bun run build` succeeds
- [ ] You've read through all new code once (code review yourself)

Then:
```bash
rm -rf apps/facilitator apps/finance
git add -A
git commit -m "Merge apps/facilitator and apps/finance into apps/x402 ..."
```

---

**Next Agent**: Use this file as a visual checklist. If a file is marked `[NEW]`, create it. If marked `[KEEP]`, don't modify. If marked `[UPDATE]`, edit carefully and preserve existing logic.
