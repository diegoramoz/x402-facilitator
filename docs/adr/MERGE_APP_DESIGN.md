# ADR: Merge Facilitator & Finance into Unified Next.js App (apps/x402)

**Date**: 2026-05-14  
**Status**: Accepted  
**Stakeholders**: Diego (implementation)

## Decision Summary

Consolidate `apps/facilitator` (Hono backend service) and `apps/finance` (Next.js frontend) into a single `apps/x402` Next.js app with unified auth, oRPC API routers, and admin dashboard.

## 25 Locked Design Decisions

### Architecture & Integration (Q1-3)

**Q1: In-process vs separate service for facilitator**
- **Decision**: In-process module exposed through Next route handlers
- **Rationale**: Removes cross-service auth, simplifies local dev, matches migration path
- **Impact**: All facilitator logic becomes part of apps/x402 codebase

**Q2: Public vs admin API routers**
- **Decision**: Two separate oRPC routers with different auth policies
- **Rationale**: Clean security boundary, separate metrics, easier versioning
- **Details**:
  - Public router: API key auth, published OpenAPI spec
  - Admin router: Session auth, internal only

**Q3: Technology stack**
- **Decision**: Next.js 16 with oRPC for all APIs, better-auth for dashboard auth
- **Rationale**: Auto OpenAPI generation, clean type-safety, unifies frontend/backend
- **Details**: Leverage existing finance app as runtime baseline

### Auth & Access Control (Q4-6)

**Q4: Multi-tenant vs single-tenant auth**
- **Decision**: Light multi-tenant from day 1 (organization + member model)
- **Rationale**: Prevents painful auth migration later, enables inviting customers
- **Details**:
  - Organization owns resource servers
  - Member enforces org boundary on all queries
  - Single user for v1 (no permission complexity yet)

**Q5: Role-based access control (RBAC)**
- **Decision**: Single admin role only (v1 simplicity)
- **Rationale**: One dev accessing dashboard, avoid over-engineering
- **Details**: Full access to resource servers, keys, audit logs

**Q6: API key lifecycle**
- **Decision**: Expiring keys (90d default) with simple rotation
- **Rationale**: Safer than permanent secrets, lightweight UX, good foundation for future
- **Details**:
  - Format: `x402_live_` + 128-char secret
  - Storage: bcrypt hash + prefix + metadata (scopes, expiresAt, revokedAt, createdBy, lastUsedAt)
  - One-time reveal at creation
  - Rotation: create new, 24h overlap, then revoke old

### API Contract & Idempotency (Q7-9)

**Q7: Idempotency enforcement**
- **Decision**: Require Idempotency-Key header on POST endpoints, 24h retention
- **Rationale**: Prevents duplicate settlement risk on retries
- **Details**:
  - Scope: (apiKey, route, body hash)
  - Behavior: exact retry returns same status/body, different body returns 409
  - GET endpoints remain naturally idempotent

**Q8: Settlement semantics (sync vs async)**
- **Decision**: Async-first: return 202 immediately, clients poll status
- **Rationale**: Prevents RPC timeout, scales better, cleaner UX
- **Details**:
  - POST settle returns settlementId + pending status immediately
  - GET status endpoint for polling
  - Webhook delivery added later if needed

**Q9: OpenAPI versioning strategy**
- **Decision**: Path-versioned public API (`/api/public/v1/`), unversioned admin (`/api/admin/`)
- **Rationale**: Stable partner contract, flexible internal surface
- **Details**:
  - Breaking changes → new v2 paths, support one overlapping window
  - Never break within v1

### Data & Persistence (Q10-13)

**Q10: DB migration approach**
- **Decision**: Two-phase compatibility window (Phase A: new app parallel, Phase B: delete old)
- **Rationale**: Lowest risk, testable parity, easy rollback
- **Details**:
  - Phase A: apps/x402 runs in parallel, old apps deprecated but runnable
  - Phase B: after parity gate passes, delete old apps

**Q11: Parity gate checklist**
- **Decision**: Strict "delete gate" with measurable pass criteria
- **Rationale**: Objective completion marker, prevents premature deletion
- **Details**: 7-point checklist covering auth, API, admin, OpenAPI, data, runtime, ops

**Q12: Schema strategy**
- **Decision**: Preserve facilitator tables, add columns/tables additively
- **Rationale**: Lowest migration risk, easy rollback, focuses on product not schema churn
- **Details**: Additive-only migrations, defer renames to post-launch

**Q13: Documentation approach**
- **Decision**: Docs-in-app with generated OpenAPI as source of truth
- **Rationale**: Eliminates drift, keeps partner docs consumable, reliable contract
- **Details**:
  - Public spec at `/api/public/v1/openapi.json` (JSON only)
  - Internal admin docs in repo markdown
  - CI fails if spec diff is uncommitted

### Operations & Rollout (Q14-17)

**Q14: Rate limiting & abuse controls**
- **Decision**: Per-API-key limits with endpoint-specific buckets + anomaly guards
- **Rationale**: Good safety for launch, protects settle path (expensive operationally)
- **Details**:
  - verify: 60 req/min, settle: 30 req/min, status: 120 req/min
  - 429 with Retry-After header
  - Temporary key cooldown on auth failures

**Q15: Testing strategy**
- **Decision**: Three-layer gate (contract, integration, migration + CI)
- **Rationale**: Enforces API correctness, catches regressions, objective parity
- **Details**:
  - Contract: OpenAPI + example payloads
  - Integration: end-to-end flows
  - Migration: DB migrations + facilitator scenario replay

**Q16: Production rollout**
- **Decision**: Hard cutover only (no canary, no phased rollout)
- **Rationale**: User preference for simplicity
- **Details**: When parity gate is green, delete old apps and finalize commit

**Q17: Rollback policy**
- **Decision**: None; issues handled forward without reverting
- **Rationale**: User preference for forward-only operations
- **Details**: Keep migrations additive-only for emergency escape hatch

### Implementation & Execution (Q18-25)

**Q18: PR strategy**
- **Decision**: Single commit, no PR slicing
- **Rationale**: User preference, simpler coordination
- **Details**: One large change, comprehensive testing before finalization

**Q19: Commit execution order**
- **Decision**: Build new app, wire everything, then delete old apps at the very end
- **Rationale**: Keep reference implementations available during integration
- **Details**: Delete old apps only after full gate passes on new app

**Q20: Acceptance gate commands**
- **Decision**: Mandatory ordered gate before old app deletion
- **Rationale**: Proves compile/build/migration health, validates API/docs
- **Details**:
  1. `bun run ts`
  2. `bun run build`
  3. `bun run db:generate`
  4. `bun run db:push`
  5. Dev server smoke test
  6. Endpoint smoke checks (verify, settle, status, key flows)
  7. OpenAPI generation + docs route validation
  8. Final `bun run ts && bun run build` after deletion

**Q21: Naming & scripts**
- **Decision**: `apps/x402`, package `x402`, scripts `dev:x402` → `turbo -F x402 dev`
- **Rationale**: Consistent product naming, minimizes churn
- **Details**:
  - Temp alias: `dev:finance` → `dev:x402` during migration
  - API: `/api/public/v1/`, `/api/admin/`

**Q22: OpenAPI exposure**
- **Decision**: JSON-only spec at `/api/public/v1/openapi.json`, no UI for now
- **Rationale**: User preference for simplicity, can add UI later
- **Details**: Build artifact `openapi-public-v1.json` for SDK generation

**Q23: Error envelope**
- **Decision**: Unified structured error shape across public and admin
- **Rationale**: Predictable SDK generation, simpler logging and support
- **Details**:
  ```json
  {
    "error": { "code": "...", "message": "...", "details": "..." },
    "requestId": "...",
    "timestamp": ...
  }
  ```

**Q24: HTTP semantics for settle**
- **Decision**: 202 Accepted for all settle returns (no 402 in public API)
- **Rationale**: Cleaner async job queue semantics, no HTTP confusion
- **Details**: Returns 202 pending or 200 confirmed, never 402

**Q25: Documentation structure**
- **Decision**: CONTEXT.md + ADR for design + IMPLEMENTATION_PLAN.md for steps
- **Rationale**: Separate concerns, other agents can follow prescriptive plan
- **Details**: Document first, then implement

## Rejected Alternatives

1. **Keep separate services**: Would require inter-service auth, network hops, coordinated deploys
2. **Phased canary rollout**: User prefers hard cutover for simplicity
3. **Destroy-and-rebuild schema**: Risky, additive-only is safer for one-commit migration
4. **Complex RBAC from day 1**: Single role sufficient for v1, scales well for future

## Implementation Hand-off

This ADR is locked. Next agent follows `IMPLEMENTATION_PLAN.md` step-by-step to build `apps/x402` and execute the acceptance gate.

All 25 decisions are immutable for this implementation cycle.
