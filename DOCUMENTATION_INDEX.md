# Documentation Index — x402 Merge Implementation Package

All documents have been created. **Start with HANDOFF.md** or follow the reading order below.

## 📋 Reading Order for Next Agent

### Entry Point
1. **[HANDOFF.md](HANDOFF.md)** (5 min) — Overview, success criteria, roadmap
   - What you're building
   - How long it takes  
   - What not to do
   - Acceptance gate checklist

### Understanding
2. **[docs/CONTEXT.md](docs/CONTEXT.md)** (10 min) — Domain model
   - Key concepts (Resource Servers, API Keys, Verification, Settlement)
   - Architecture overview
   - Routes and APIs at a glance
   - Auth models
   - Rate limits and error handling

### Design Decisions
3. **[docs/adr/MERGE_APP_DESIGN.md](docs/adr/MERGE_APP_DESIGN.md)** (15 min) — All 25 decisions
   - Read the summary table first (questions 1-25)
   - If uncertain about a decision, read the full rationale
   - **This is locked — don't change it**

### Building
4. **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** (60-120 min) — Step-by-step instructions
   - Follow Phases 1-9 sequentially
   - Each phase has numbered steps
   - Code examples provided
   - This is your main execution guide

### References (Use During Coding)
5. **[DATABASE_MIGRATION_SPEC.md](DATABASE_MIGRATION_SPEC.md)** — Exact schema changes
   - SQL migration code
   - Drizzle TypeScript schemas
   - Rollback instructions
   - Use when building Phase 3

6. **[FILE_STRUCTURE_REFERENCE.md](FILE_STRUCTURE_REFERENCE.md)** — Directory tree and checklist
   - Visual file structure
   - Which files to keep/create/update
   - File relationships
   - Use as visual checklist while coding

---

## 📁 Document Locations

```
/docs/
  ├── CONTEXT.md                    [Domain model + concepts]
  └── adr/
      └── MERGE_APP_DESIGN.md       [25 design decisions]

/HANDOFF.md                          [Start here]
/IMPLEMENTATION_PLAN.md              [Main build guide]
/DATABASE_MIGRATION_SPEC.md          [Schema changes]
/FILE_STRUCTURE_REFERENCE.md         [File structure]
/DOCUMENTATION_INDEX.md              [This file]
```

---

## 🎯 Quick Navigation

**I want to understand the design:**
→ Read `docs/CONTEXT.md`, then `docs/adr/MERGE_APP_DESIGN.md`

**I want to know what to build:**
→ Read `FILE_STRUCTURE_REFERENCE.md` for visual overview

**I want step-by-step instructions:**
→ Follow `IMPLEMENTATION_PLAN.md` Phases 1-9 in order

**I need to know database schema:**
→ Use `DATABASE_MIGRATION_SPEC.md` (SQL + Drizzle)

**I want the quick success checklist:**
→ See `HANDOFF.md` section "Acceptance Gate"

**I'm stuck on a design decision:**
→ Check `docs/adr/MERGE_APP_DESIGN.md` for rationale

---

## ✅ Pre-Implementation Checklist

Before you start coding:

- [ ] I've read `HANDOFF.md` completely
- [ ] I've read `docs/CONTEXT.md` and understand the domain
- [ ] I've scanned `docs/adr/MERGE_APP_DESIGN.md` and noted the 25 decisions
- [ ] I've reviewed `FILE_STRUCTURE_REFERENCE.md` to see the file layout
- [ ] I understand the 9 phases in `IMPLEMENTATION_PLAN.md`
- [ ] I have `DATABASE_MIGRATION_SPEC.md` open as reference
- [ ] I understand the acceptance gate (12 items that must pass)
- [ ] I know old apps get deleted only after Phase 9.3

---

## 📊 Document Purpose Matrix

| Question | Document | Section |
|----------|----------|---------|
| What am I building? | HANDOFF.md | "What You're About to Build" |
| How long will this take? | HANDOFF.md | "Your Roadmap" |
| What are the key concepts? | CONTEXT.md | "Key Concepts" |
| What routes exist? | CONTEXT.md | "Routes & APIs" |
| What auth models? | CONTEXT.md | "Auth Models" |
| How do I build it? | IMPLEMENTATION_PLAN.md | All Phases 1-9 |
| What database tables? | DATABASE_MIGRATION_SPEC.md | "New Tables" |
| What files to create? | FILE_STRUCTURE_REFERENCE.md | "Directory Tree" |
| Did Diego decide this? | ADR_MERGE_APP_DESIGN.md | "25 Decisions" |
| What's the acceptance gate? | HANDOFF.md | "Acceptance Gate" |
| What not to do? | HANDOFF.md | "What Not to Do" |
| Which file do I edit first? | FILE_STRUCTURE_REFERENCE.md | "Critical Pathways" |

---

## 🚀 Start Here

```
1. Open HANDOFF.md
2. Read "Your Roadmap" section (5 min)
3. Follow the 4-phase roadmap
4. Reference other docs as you code
5. Pass the acceptance gate
6. Delete old apps
7. Commit
```

---

## 🔒 Locked Scope

These **cannot** change during implementation:

✅ All 25 design decisions (see ADR)  
✅ oRPC for API generation  
✅ Public API path: `/api/public/v1/`  
✅ Admin API path: `/api/admin/`  
✅ App name: `apps/x402`  
✅ Single commit (no PRs)  
✅ Old apps deleted before commit  
✅ Acceptance gate criteria (all 12 items)  
✅ Database: additive migrations only  

---

## 🎓 How to Use These Docs

### During Phase 1-3 (Foundation)
- Keep `FILE_STRUCTURE_REFERENCE.md` open
- Reference `CONTEXT.md` for naming conventions
- Check `IMPLEMENTATION_PLAN.md` for exact file paths

### During Phase 4-6 (Auth & Handlers)
- Use `DATABASE_MIGRATION_SPEC.md` for schema details
- Reference `docs/adr/MERGE_APP_DESIGN.md` Q7-9 for middleware decisions
- Check `CONTEXT.md` "Auth Models" for exact auth flow

### During Phase 7-9 (Testing & Gate)
- Use `HANDOFF.md` "Acceptance Gate" as checklist
- Reference `IMPLEMENTATION_PLAN.md` Phase 9 for exact commands
- Double-check against `docs/adr/MERGE_APP_DESIGN.md` Q15 (testing strategy)

---

## 🤝 Handoff Contract

Diego (Designer) promises:
- ✅ All 25 decisions are locked and final
- ✅ No design changes during implementation
- ✅ All docs are complete and unambiguous
- ✅ Acceptance gate is objective (not subjective)

Next Agent (Implementer) promises:
- ✅ Follow IMPLEMENTATION_PLAN.md exactly
- ✅ Don't change locked decisions
- ✅ Test before committing
- ✅ One atomic commit
- ✅ Delete old apps only after gate passes

---

## 📞 Getting Help

If unclear on something:
1. Check the "Quick Navigation" section above
2. Search the relevant document for keywords
3. Read the full rationale in `docs/adr/MERGE_APP_DESIGN.md`
4. If still stuck, note the issue and return to Diego

---

**Ready to build?** Start with [HANDOFF.md](HANDOFF.md) →
