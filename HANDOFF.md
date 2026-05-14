# x402 Merge: Complete Implementation Package

**Status**: Design locked, ready for implementation handoff  
**Date**: 2026-05-14  
**Author**: Diego (designer), [Agent Name] (implementer)

## What You're About to Build

Merge `apps/facilitator` (Hono backend) and `apps/finance` (Next.js frontend) into a single **apps/x402** Next.js app with:

- ✅ Unified authentication (better-auth passkey)
- ✅ Public API for payment partners (oRPC, OpenAPI)
- ✅ Admin dashboard for key and resource server management
- ✅ In-process facilitator logic (no separate service)
- ✅ API key auth with scopes, expiry, rotation
- ✅ Idempotency enforcement on POST endpoints
- ✅ Rate limiting per endpoint
- ✅ Multi-tenant foundation (orgs + members)
- ✅ All in a single production commit

## Your Roadmap

### 1. Pre-Flight (5 min)
Read these in order:
- [ ] `docs/CONTEXT.md` — understand the domain
- [ ] `docs/adr/MERGE_APP_DESIGN.md` — know all 25 decisions
- [ ] `IMPLEMENTATION_PLAN.md` — see the exact steps

### 2. Build Phase (2-4 hours)
Follow `IMPLEMENTATION_PLAN.md` Phases 1-7:
- [ ] Create apps/x402 from finance baseline
- [ ] Build oRPC routers (public + admin)
- [ ] Wire auth middleware and handlers
- [ ] Add database migrations
- [ ] Integrate facilitator logic
- [ ] Generate OpenAPI spec
- [ ] Create integration tests

### 3. Validation Phase (30 min)
Run acceptance gate (Phase 9 in IMPLEMENTATION_PLAN.md):
- [ ] `bun run ts` ✅
- [ ] `bun run build` ✅
- [ ] `bun run db:push` ✅
- [ ] `bun run dev:x402` + smoke tests ✅
- [ ] OpenAPI spec validates ✅
- [ ] All tests pass ✅

### 4. Completion Phase (5 min)
- [ ] Delete old apps
- [ ] Final build check
- [ ] Single commit with full history

## Key Documents to Reference

| Document | Purpose | When to Use |
|----------|---------|------------|
| `docs/CONTEXT.md` | Domain model, concepts, routes | Understanding scope |
| `docs/adr/MERGE_APP_DESIGN.md` | 25 locked decisions + rationale | Design questions |
| `IMPLEMENTATION_PLAN.md` | Step-by-step build phases | During coding |
| `DATABASE_MIGRATION_SPEC.md` | Exact schema + SQL | When building DB layer |
| `FILE_STRUCTURE_REFERENCE.md` | Directory tree + file checklist | Visual reference |
| `docs/adr/MERGE_APP_DESIGN.md` (section 17+) | Exception handling + ops | Error/edge cases |

## Critical Success Criteria

Before you consider this done:

1. **App compiles**: `bun run build` passes
2. **Types pass**: `bun run ts` succeeds
3. **Database migrates**: `bun run db:push` applies cleanly
4. **Public API works**: verify, settle, status endpoints functional
5. **Admin works**: key create/revoke/rotate flows complete
6. **Auth enforced**: API key scopes and session auth checked
7. **Idempotency enforced**: same key+body returns same response, conflict on mismatch
8. **OpenAPI generated**: spec at `/api/public/v1/openapi.json` is valid JSON
9. **Tests pass**: integration + contract tests green
10. **Old apps deleted**: facilitator + finance removed
11. **Single commit**: one atomic change with full git history

## Naming Lock (Don't Deviate)

These names are set in stone for this implementation:

- App folder: `apps/x402`
- Package name: `x402`
- Dev script: `dev:x402` (via turbo)
- Public API base: `/api/public/v1/`
- Admin API base: `/api/admin/`
- Docs: `/docs` and `/api/public/v1/openapi.json`

## What Not to Do

❌ Don't start coding without reading the 3 main docs  
❌ Don't change the 25 locked design decisions  
❌ Don't split this into multiple commits  
❌ Don't refactor old facilitator code during migration  
❌ Don't remove old apps before acceptance gate passes  
❌ Don't create breaking API changes not covered in ADR  
❌ Don't skip the integration tests  

## Acceptance Gate (Mandatory)

Run this exact sequence in order. **All must pass**:

```bash
# Phase 9.1: Type check
bun run ts

# Phase 9.2: Build
bun run build

# Phase 9.3: Database
bun run db:generate
bun run db:push

# Phase 9.4: Dev server + manual tests
bun run dev:x402
# In another terminal, test:
# POST /api/public/v1/verify with API key → 200
# POST /api/public/v1/settle with API key → 202
# GET /api/public/v1/status/verification/{id} → 200 or 404
# GET /api/public/v1/openapi.json → valid JSON
# Create/revoke API key in admin → works

# Phase 9.5: Final check
bun run build
bun run ts
```

## Unknown Unknowns to Watch

These weren't fully specified and may need judgment calls:

1. **Rate limit backend**: In-memory token bucket or Redis?
   - Recommendation: In-memory for v1, sufficient for single-server
2. **Test framework**: Which test runner?
   - Assumption: Use whatever exists in apps/finance (likely vitest or jest)
3. **OpenAPI UI rendering**: Just JSON or add Swagger?
   - Locked: JSON only for v1 (can add UI later)
4. **Facilitator logic home**: Keep in apps/x402 or move to packages/facilitator?
   - Recommendation: Keep in apps/x402/app/api for simplicity, no separate package

## Emergency Contacts

If fundamentally stuck:
1. Reread the relevant section of `IMPLEMENTATION_PLAN.md`
2. Check `docs/adr/MERGE_APP_DESIGN.md` for the underlying decision
3. Verify you haven't accidentally changed a locked decision
4. If a decision needs adjustment, document why and hand back to Diego

## Handoff Notes

- This entire package was designed to be **unambiguous**
- All decisions are **locked** — no "what if" rewrites during implementation
- You have **everything** needed to build this without asking questions
- The acceptance gate is **objective** — no subjective "looks good"
- One commit means **no intermediate feedback cycles** — test locally thoroughly before finalizing

---

**You have 25 locked decisions, 9 implementation phases, a database schema, file structure, and an objective acceptance gate.**

**Go build it.** 🚀

---

## Quick Links

- Start here: `docs/CONTEXT.md`
- Then: `docs/adr/MERGE_APP_DESIGN.md`
- Then: `IMPLEMENTATION_PLAN.md`
- Reference: `DATABASE_MIGRATION_SPEC.md` + `FILE_STRUCTURE_REFERENCE.md`

Good luck!
