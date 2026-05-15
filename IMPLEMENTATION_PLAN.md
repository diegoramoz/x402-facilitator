# Implementation Plan: Merge Facilitator & Finance into apps/x402

**Status**: Ready for handoff  
**Duration**: Single commit  
**Executor**: Next agent  

## Pre-Implementation Checklist

- [ ] Read `docs/CONTEXT.md` (domain model)
- [ ] Read `docs/adr/MERGE_APP_DESIGN.md` (25 locked decisions)
- [ ] Verify existing `apps/finance` and `apps/facilitator` both build
- [ ] Ensure `bun install` passes (current terminal shows exit code 1, fix first)

## Phase 1: Foundation (Create apps/x402)

### Step 1.1: Clone finance as x402 base
```bash
cp -r apps/finance apps/x402
cd apps/x402
```

### Step 1.2: Update package.json
**File**: `apps/x402/package.json`
- Change `"name": "finance"` to `"name": "x402"`
- Keep all dependencies from finance (you'll add oRPC deps in Step 2)
- Add new scripts section:
  ```json
  "scripts": {
    "dev": "portless x402 next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  }
  ```

### Step 1.3: Update layout.tsx and app structure
**File**: `apps/x402/app/layout.tsx`
- Keep existing auth providers and layout structure from finance
- Keep existing styling and providers

### Step 1.4: Update next.config.ts (if needed)
**File**: `apps/x402/next.config.ts`
- Ensure no finance-specific branding or environment variables
- Keep existing Next.js optimizations

## Phase 2: oRPC Router Structure

### Step 2.1: Create public router
**New file**: `apps/x402/app/api/routers/public.ts`

```typescript
import { publicProcedure } from "./procedures";
import { z } from "zod";

// TODO: Import facilitator verification & settlement logic
// For now, stub implementations that accept the request structure

export const publicRouter = {
  verify: publicProcedure
    .input(
      z.object({
        paymentDetails: z.object({
          amount: z.string(),
          currency: z.string(),
          networkId: z.string(),
        }),
        paymentPayload: z.object({
          amount: z.string(),
          signature: z.string(),
          timestamp: z.number(),
          clientAddress: z.string().optional(),
        }),
      })
    )
    .handler(async ({ input }) => {
      // TODO: Call facilitator verification logic
      // Return: { verificationId, isValid, timestamp, reason? }
      throw new Error("Not implemented");
    }),

  settle: publicProcedure
    .input(
      z.object({
        verificationId: z.string(),
        paymentDetails: z.object({
          amount: z.string(),
          currency: z.string(),
          networkId: z.string(),
        }),
        paymentPayload: z.object({
          amount: z.string(),
          signature: z.string(),
          timestamp: z.number(),
          clientAddress: z.string().optional(),
        }),
      })
    )
    .handler(async ({ input }) => {
      // TODO: Call facilitator settlement logic
      // Return: { settlementId, status: "pending" | "confirmed" | "failed", transactionHash?, error? }
      throw new Error("Not implemented");
    }),

  getVerificationStatus: publicProcedure
    .input(z.object({ verificationId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Query facilitator status
      throw new Error("Not implemented");
    }),

  getSettlementStatus: publicProcedure
    .input(z.object({ settlementId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Query facilitator status
      throw new Error("Not implemented");
    }),
};

export type PublicRouter = typeof publicRouter;
```

### Step 2.2: Create admin router
**New file**: `apps/x402/app/api/routers/admin.ts`

```typescript
import { protectedProcedure } from "./procedures";
import { z } from "zod";
import { db } from "@ramoz/db";
// TODO: Import schema when created

export const adminRouter = {
  // Key management
  createApiKey: protectedProcedure
    .input(z.object({ resourceServerId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Generate key, hash, store with scopes
      throw new Error("Not implemented");
    }),

  revokeApiKey: protectedProcedure
    .input(z.object({ apiKeyId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Set revokedAt
      throw new Error("Not implemented");
    }),

  rotateApiKey: protectedProcedure
    .input(z.object({ apiKeyId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Create new key, mark old for expiry
      throw new Error("Not implemented");
    }),

  listApiKeys: protectedProcedure
    .input(z.object({ resourceServerId: z.string() }))
    .handler(async ({ input }) => {
      // TODO: Return keys (masked secret)
      throw new Error("Not implemented");
    }),

  // Resource server management
  createResourceServer: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().optional() }))
    .handler(async ({ input }) => {
      // TODO: Create server record
      throw new Error("Not implemented");
    }),

  listResourceServers: protectedProcedure.handler(async () => {
    // TODO: List all servers for org
    throw new Error("Not implemented");
  }),
};

export type AdminRouter = typeof adminRouter;
```

### Step 2.3: Create procedures.ts
**New file**: `apps/x402/app/api/routers/procedures.ts`

```typescript
import { initTRPC } from "@trpc/server";
import { getSession } from "@ramoz/auth/auth-server";
import type { NextRequest } from "next/server";

// TODO: Define context based on NextRequest
// - For public: extract + validate API key from Authorization header
// - For admin: extract session from better-auth

export const publicProcedure = {}; // TODO: Implement
export const protectedProcedure = {}; // TODO: Implement (requires session)
```

### Step 2.4: Create route handler
**New file**: `apps/x402/app/api/route.ts`

```typescript
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "@ramoz/api/context";
import type { NextRequest } from "next/server";
import { publicRouter } from "./routers/public";
import { adminRouter } from "./routers/admin";

const appRouter = {
  public: publicRouter,
  admin: adminRouter,
};

// TODO: Wire oRPC handlers for both routing and OpenAPI generation

export const GET = async (req: NextRequest) => {
  // TODO: Implement
  return new Response("Not implemented", { status: 501 });
};

export const POST = async (req: NextRequest) => {
  // TODO: Implement
  return new Response("Not implemented", { status: 501 });
};
```

## Phase 3: Database & Migrations

### Step 3.1: Add facilitator schema extension
**New file**: `packages/db/schema-x402-extensions.ts`

Purpose: Define new tables/columns for x402 integration (scopes, idempotency, audit).

```typescript
// TODO: Define these tables:
// - api_key_scope (scope per key)
// - idempotency_response (response cache for Idempotency-Key)
// - api_audit_log (optional, for dashboard visibility)
// - organization (tenant model)
```

### Step 3.2: Create migration
**New file**: `packages/db/migrations/TIMESTAMP_x402_merge_foundation.sql`

Purpose: Apply schema extensions.

```sql
-- TODO: 
-- 1. Add columns to facilitator.api_key: scopes, createdBy, expiresAt, revokedAt
-- 2. Create idempotency_response table
-- 3. Create organization table
-- 4. Create organization_member table
```

### Step 3.3: Update db exports
**File**: `packages/db/index.ts`
- Export new schema types from schema-x402-extensions.ts

## Phase 4: Auth Middleware & Handlers

### Step 4.1: Create API key auth middleware
**New file**: `apps/x402/app/api/middleware/api-key-auth.ts`

```typescript
import { db } from "@ramoz/db";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

export async function verifyApiKey(authHeader: string | undefined) {
  // TODO:
  // 1. Extract "Bearer <key>" from header
  // 2. Find all active api keys
  // 3. bcrypt.compare each until match found
  // 4. Update lastUsedAt
  // 5. Return { resourceServerId, keyId, scopes }
  // 6. If no match or key expired/revoked, return null
}
```

### Step 4.2: Create idempotency middleware
**New file**: `apps/x402/app/api/middleware/idempotency.ts`

```typescript
import { db } from "@ramoz/db";
import crypto from "node:crypto";

export async function checkIdempotency(
  apiKeyId: string,
  route: string,
  bodyHash: string,
  idempotencyKey: string
) {
  // TODO:
  // 1. Hash the triplet (apiKeyId, route, bodyHash)
  // 2. Query idempotency table for key match
  // 3. If found and same key: return cached response
  // 4. If found and different key: return 409 conflict
  // 5. If not found: allow request to proceed
}

export async function storeIdempotencyResponse(
  apiKeyId: string,
  route: string,
  bodyHash: string,
  idempotencyKey: string,
  response: any
) {
  // TODO: Store response for 24h
}
```

### Step 4.3: Create rate limit middleware
**New file**: `apps/x402/app/api/middleware/rate-limit.ts`

```typescript
import Redis from "ioredis";

// TODO: Implement token-bucket rate limiting per API key + route
// - verify: 60 req/min
// - settle: 30 req/min
// - status: 120 req/min
// Return: { allowed: boolean, retryAfter?: number }
```

## Phase 5: Facilitator Integration

### Step 5.1: Extract facilitator logic to reusable module
**New path**: `packages/facilitator/` (or keep in apps/x402)

Purpose: Import and adapt existing verification and settlement logic from apps/facilitator.

**Files to create**:
- `verify.ts` — payment verification logic
- `settle.ts` — settlement logic with viem
- `types.ts` — shared types

### Step 5.2: Wire handlers in public router
Update `apps/x402/app/api/routers/public.ts`:
```typescript
import { verifyPayment, settlePayment, getVerificationStatus, getSettlementStatus } from "@ramoz/facilitator";

// In verify handler:
const response = await verifyPayment(resourceServerId, input);

// In settle handler:
const response = await settlePayment(resourceServerId, input);
```

## Phase 6: OpenAPI Generation & Docs

### Step 6.1: Wire OpenAPI generation in route handler
**File**: `apps/x402/app/api/route.ts`

```typescript
// TODO: Use @orpc/openapi to generate spec for public router
// Expose at /api/v2/openapi.json
```

### Step 6.2: Add docs route (JSON only)
**New file**: `apps/x402/app/docs/route.ts`

```typescript
export async function GET() {
  // TODO: Redirect to /api/v2/openapi.json or serve minimal docs page
}
```

## Phase 7: Testing & Validation

### Step 7.1: Create integration tests
**New file**: `apps/x402/__tests__/public-api.test.ts`

```typescript
// TODO: Test scenarios:
// 1. verify endpoint with valid signature
// 2. settle endpoint returns 202
// 3. status polling works
// 4. idempotency replay returns same response
// 5. idempotency conflict returns 409
// 6. rate limit returns 429
// 7. invalid API key returns 401
```

### Step 7.2: Create contract tests
**New file**: `apps/x402/__tests__/contract.test.ts`

```typescript
// TODO: Validate OpenAPI spec:
// 1. public v1 endpoints present
// 2. auth header documented
// 3. error schema matches expected envelope
// 4. example payloads are valid
```

## Phase 8: Migration Verification

### Step 8.1: Migrate facilitator tables
```bash
cd apps/x402
bun run db:generate
bun run db:push
```

### Step 8.2: Data validation
```typescript
// TODO: Verify:
// 1. Existing payment_verification records accessible
// 2. Existing settlement records accessible
// 3. Resource servers migrated/created
// 4. API keys migrated and still hashable
```

## Phase 9: Execution & Acceptance Gate

### Step 9.1: Build acceptance gate sequence
Run in order, all must pass:

```bash
# 1. Type checking
bun run ts

# 2. Build
bun run build

# 3. DB migration
bun run db:generate
bun run db:push

# 4. Dev smoke test
# In separate terminal:
bun run dev:x402
# In another terminal, manual checks:
# - POST http://localhost:3000/api/v2/verify with valid key → 200
# - POST http://localhost:3000/api/v2/settle with valid key → 202
# - GET http://localhost:3000/api/v2/status/verification/xxx → 200 or 404
# - GET http://localhost:3000/api/v2/openapi.json → valid JSON spec
# - GET http://localhost:3000/docs → serves docs

# 5. Final build after validation
bun run build
bun run ts
```

### Step 9.2: Check all gate items
- [ ] `bun run ts` passes
- [ ] `bun run build` passes
- [ ] `bun run db:push` succeeds
- [ ] Dev server starts (bun run dev:x402)
- [ ] verify endpoint works with API key auth
- [ ] settle endpoint returns 202
- [ ] status endpoints functional
- [ ] admin key creation/revoke works
- [ ] OpenAPI spec generates and validates
- [ ] Integration tests pass
- [ ] Error envelopes match spec

### Step 9.3: Delete old apps (only after all checks green)
```bash
rm -rf apps/facilitator
rm -rf apps/finance
```

### Step 9.4: Final verification
```bash
bun run ts
bun run build
```

### Step 9.5: Commit
```bash
git add -A
git commit -m "Merge apps/facilitator and apps/finance into apps/x402

- Create unified Next.js app with oRPC public and admin routers
- Integrate facilitator payment verification and settlement as internal handlers
- Add API key auth with scopes, expiry, and rotation support
- Implement idempotency enforcement on POST endpoints
- Add rate limiting per endpoint and API key
- Generate OpenAPI spec for public v1 API (JSON only)
- Add organization and membership foundation for multi-tenant support
- Preserve all facilitator settlement history and verification records
- Delete old apps/facilitator and apps/finance after parity gate passes

See docs/adr/MERGE_APP_DESIGN.md for 25 locked design decisions
See IMPLEMENTATION_PLAN.md for full execution details"
```

## Testing Checklist

Before final commit, verify:
- [ ] All old integration scripts still reference correct paths (or updated)
- [ ] Turbo can build x402 app
- [ ] Database migrations are idempotent (can run twice)
- [ ] No hardcoded references to "finance" or "facilitator" in x402 code
- [ ] OpenAPI spec is valid JSON and includes all endpoints
- [ ] Idempotency header enforcement works
- [ ] Rate limits are correctly applied
- [ ] API key scopes are enforced

## Known Unknowns (For Next Agent)

These need implementation but weren't fully specified in design:
1. **Rate limit storage backend**: Redis? In-memory? (for v1, in-memory token bucket is likely OK)
2. **oRPC router exact syntax**: Confirm exact oRPC procedure and router patterns
3. **Test framework**: Existing test setup in apps/x402? (likely vitest or jest)
4. **OpenAPI UI**: Swagger UI or custom? (JSON-only for v1)

## Rollback Escape Hatches

If critical issue post-commit:
1. Database migrations are additive-only, so old facilitator tables remain queryable
2. If new API endpoints fail, can temporarily disable with env flag
3. Can re-enable old services by reverting one commit (then manually delete again)

## Success Criteria

✅ Single commit created  
✅ All 9 phases completed  
✅ Acceptance gate 100% green  
✅ Old apps deleted  
✅ Build and types pass  
✅ Migrations clean on fresh DB  
✅ Public API contract validated  
✅ Admin flows operational  
✅ OpenAPI spec generated and published  
