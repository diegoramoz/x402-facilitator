# Database Migration Specification for x402 Merge

**Target**: Additive migration to facilitate x402 unified app  
**Scope**: Extend existing facilitator schema with new tables and columns  
**Approach**: Additive-only (no drops, renames, or destructive changes)

## New Tables

### 1. organization

Purpose: Tenant boundary for multi-tenant v1 foundation.

```sql
CREATE TABLE IF NOT EXISTS facilitator.organization (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,
  is_active integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT organization_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS organization_nano_id_idx ON facilitator.organization(nano_id);
CREATE INDEX IF NOT EXISTS organization_slug_idx ON facilitator.organization(slug);
```

**Drizzle Schema**:
```typescript
export const organization = facilitatorSchema.table(
  "organization",
  {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    nanoId: varchar({ length: NANO_ID_LENGTH })
      .$defaultFn(() => myNanoid())
      .notNull()
      .unique(),
    name: text().notNull(),
    slug: varchar({ length: 255 }).notNull().unique(),
    description: text(),
    isActive: integer().notNull().default(1),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("organization_nano_id_idx").on(t.nanoId),
    index("organization_slug_idx").on(t.slug),
  ]
);
```

### 2. organization_member

Purpose: Assign users to organizations.

```sql
CREATE TABLE IF NOT EXISTS facilitator.organization_member (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  organization_id bigint NOT NULL REFERENCES facilitator.organization(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL DEFAULT 'developer',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT organization_member_pkey PRIMARY KEY (id),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_member_organization_id_idx 
  ON facilitator.organization_member(organization_id);
CREATE INDEX IF NOT EXISTS organization_member_user_id_idx 
  ON facilitator.organization_member(user_id);
CREATE INDEX IF NOT EXISTS organization_member_nano_id_idx 
  ON facilitator.organization_member(nano_id);
```

**Drizzle Schema**:
```typescript
export const organizationMember = facilitatorSchema.table(
  "organization_member",
  {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    nanoId: varchar({ length: NANO_ID_LENGTH })
      .$defaultFn(() => myNanoid())
      .notNull()
      .unique(),
    organizationId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar({ length: 50 }).notNull().default("developer"),
    joinedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("organization_member_organization_id_idx").on(t.organizationId),
    index("organization_member_user_id_idx").on(t.userId),
    index("organization_member_nano_id_idx").on(t.nanoId),
    uniqueIndex("organization_member_org_user_unique").on(
      t.organizationId,
      t.userId
    ),
  ]
);
```

### 3. idempotency_response

Purpose: Cache settle/verify responses for Idempotency-Key header.

```sql
CREATE TABLE IF NOT EXISTS facilitator.idempotency_response (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  api_key_id bigint NOT NULL REFERENCES facilitator.api_key(id) ON DELETE CASCADE,
  route varchar(255) NOT NULL,
  request_hash varchar(64) NOT NULL,
  idempotency_key varchar(255) NOT NULL,
  response_status integer NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  
  CONSTRAINT idempotency_response_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idempotency_response_api_key_id_idx 
  ON facilitator.idempotency_response(api_key_id);
CREATE INDEX IF NOT EXISTS idempotency_response_idempotency_key_idx 
  ON facilitator.idempotency_response(idempotency_key);
CREATE INDEX IF NOT EXISTS idempotency_response_request_hash_idx 
  ON facilitator.idempotency_response(request_hash);
CREATE INDEX IF NOT EXISTS idempotency_response_expires_at_idx 
  ON facilitator.idempotency_response(expires_at);
```

**Drizzle Schema**:
```typescript
export const idempotencyResponse = facilitatorSchema.table(
  "idempotency_response",
  {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    nanoId: varchar({ length: NANO_ID_LENGTH })
      .$defaultFn(() => myNanoid())
      .notNull()
      .unique(),
    apiKeyId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => apiKey.id, { onDelete: "cascade" }),
    route: varchar({ length: 255 }).notNull(),
    requestHash: varchar({ length: 64 }).notNull(),
    idempotencyKey: varchar({ length: 255 }).notNull(),
    responseStatus: integer().notNull(),
    responseBody: json().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
  },
  (t) => [
    index("idempotency_response_api_key_id_idx").on(t.apiKeyId),
    index("idempotency_response_idempotency_key_idx").on(t.idempotencyKey),
    index("idempotency_response_request_hash_idx").on(t.requestHash),
    index("idempotency_response_expires_at_idx").on(t.expiresAt),
  ]
);
```

### 4. api_audit_log (Optional for v1)

Purpose: Audit trail for admin dashboard.

```sql
CREATE TABLE IF NOT EXISTS facilitator.api_audit_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  organization_id bigint NOT NULL REFERENCES facilitator.organization(id) ON DELETE CASCADE,
  actor_user_id bigint REFERENCES public."user"(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  resource_type varchar(100) NOT NULL,
  resource_id varchar(255),
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT api_audit_log_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS api_audit_log_organization_id_idx 
  ON facilitator.api_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS api_audit_log_created_at_idx 
  ON facilitator.api_audit_log(created_at);
```

**Drizzle Schema**:
```typescript
export const apiAuditLog = facilitatorSchema.table(
  "api_audit_log",
  {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    nanoId: varchar({ length: NANO_ID_LENGTH })
      .$defaultFn(() => myNanoid())
      .notNull()
      .unique(),
    organizationId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    actorUserId: bigint({ mode: "bigint" }).references(() => user.id, {
      onDelete: "set null",
    }),
    action: varchar({ length: 100 }).notNull(),
    resourceType: varchar({ length: 100 }).notNull(),
    resourceId: varchar({ length: 255 }),
    details: json(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("api_audit_log_organization_id_idx").on(t.organizationId),
    index("api_audit_log_created_at_idx").on(t.createdAt),
  ]
);
```

## Column Additions

### Extend facilitator.api_key

Add new columns for scopes, expiry, and rotation support.

```sql
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS scopes text;
-- Example: "verify:payment,read:status" (comma-separated)

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS created_by bigint REFERENCES public."user"(id) ON DELETE SET NULL;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS key_prefix varchar(50);
-- Example: "x402_live_abc123"

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS api_key_key_prefix_idx ON facilitator.api_key(key_prefix);
CREATE INDEX IF NOT EXISTS api_key_expires_at_idx ON facilitator.api_key(expires_at);
CREATE INDEX IF NOT EXISTS api_key_revoked_at_idx ON facilitator.api_key(revoked_at);
```

**Drizzle Schema Update** (in existing apiKey table):
```typescript
export const apiKey = facilitatorSchema.table(
  "api_key",
  {
    // ... existing columns ...
    scopes: text(), // "verify:payment,settle:payment,read:status"
    createdBy: bigint({ mode: "bigint" }).references(() => user.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp({ withTimezone: true }),
    revokedAt: timestamp({ withTimezone: true }),
    keyPrefix: varchar({ length: 50 }),
    // ... keep existing columns unchanged ...
  },
  (t) => [
    // ... existing indexes ...
    index("api_key_key_prefix_idx").on(t.keyPrefix),
    index("api_key_expires_at_idx").on(t.expiresAt),
    index("api_key_revoked_at_idx").on(t.revokedAt),
  ]
);
```

### Extend facilitator.resource_server

Add organization ownership.

```sql
ALTER TABLE facilitator.resource_server ADD COLUMN IF NOT EXISTS organization_id bigint REFERENCES facilitator.organization(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS resource_server_organization_id_idx 
  ON facilitator.resource_server(organization_id);
```

**Drizzle Schema Update** (in existing resourceServer table):
```typescript
export const resourceServer = facilitatorSchema.table(
  "resource_server",
  {
    // ... existing columns ...
    organizationId: bigint({ mode: "bigint" })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // ... keep existing columns unchanged ...
  },
  (t) => [
    // ... existing indexes ...
    index("resource_server_organization_id_idx").on(t.organizationId),
  ]
);
```

## Migration File

Create a new Drizzle migration file:

**File**: `packages/db/migrations/TIMESTAMP_add_x402_multi_tenant_foundation.sql`

```sql
-- ─── NEW TABLES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilitator.organization (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,
  is_active integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX organization_nano_id_idx ON facilitator.organization(nano_id);
CREATE INDEX organization_slug_idx ON facilitator.organization(slug);

CREATE TABLE IF NOT EXISTS facilitator.organization_member (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  organization_id bigint NOT NULL REFERENCES facilitator.organization(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL DEFAULT 'developer',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX organization_member_organization_id_idx ON facilitator.organization_member(organization_id);
CREATE INDEX organization_member_user_id_idx ON facilitator.organization_member(user_id);
CREATE INDEX organization_member_nano_id_idx ON facilitator.organization_member(nano_id);

CREATE TABLE IF NOT EXISTS facilitator.idempotency_response (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  api_key_id bigint NOT NULL REFERENCES facilitator.api_key(id) ON DELETE CASCADE,
  route varchar(255) NOT NULL,
  request_hash varchar(64) NOT NULL,
  idempotency_key varchar(255) NOT NULL,
  response_status integer NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

CREATE INDEX idempotency_response_api_key_id_idx ON facilitator.idempotency_response(api_key_id);
CREATE INDEX idempotency_response_idempotency_key_idx ON facilitator.idempotency_response(idempotency_key);
CREATE INDEX idempotency_response_request_hash_idx ON facilitator.idempotency_response(request_hash);
CREATE INDEX idempotency_response_expires_at_idx ON facilitator.idempotency_response(expires_at);

CREATE TABLE IF NOT EXISTS facilitator.api_audit_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  organization_id bigint NOT NULL REFERENCES facilitator.organization(id) ON DELETE CASCADE,
  actor_user_id bigint REFERENCES public."user"(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  resource_type varchar(100) NOT NULL,
  resource_id varchar(255),
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX api_audit_log_organization_id_idx ON facilitator.api_audit_log(organization_id);
CREATE INDEX api_audit_log_created_at_idx ON facilitator.api_audit_log(created_at);

-- ─── COLUMN ADDITIONS ──────────────────────────────────────────────────────
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS scopes text;
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS created_by bigint REFERENCES public."user"(id) ON DELETE SET NULL;
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone;
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS key_prefix varchar(50);

CREATE INDEX IF NOT EXISTS api_key_key_prefix_idx ON facilitator.api_key(key_prefix);
CREATE INDEX IF NOT EXISTS api_key_expires_at_idx ON facilitator.api_key(expires_at);
CREATE INDEX IF NOT EXISTS api_key_revoked_at_idx ON facilitator.api_key(revoked_at);

ALTER TABLE facilitator.resource_server ADD COLUMN IF NOT EXISTS organization_id bigint REFERENCES facilitator.organization(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS resource_server_organization_id_idx ON facilitator.resource_server(organization_id);
```

## Data Seeding (v1 Setup)

After migration, seed a default organization and associate existing resource servers:

```typescript
// apps/x402/scripts/seed-x402-org.ts
import { db } from "@ramoz/db";
import { myNanoid } from "@ramoz/db/constants";

export async function seedDefaultOrg() {
  const [org] = await db
    .insert(organization)
    .values({
      nanoId: myNanoid(),
      name: "Default Organization",
      slug: "default-org",
      description: "Initial organization for v1",
      isActive: 1,
    })
    .returning();

  // Attach all existing resource servers to this org
  await db
    .update(resourceServer)
    .set({ organizationId: org.id })
    .where(isNull(resourceServer.organizationId));

  console.log("✓ Seeded default organization and migrated resource servers");
}
```

## Rollback Safety

All changes are additive:
- ✅ New tables can be dropped without affecting old functionality
- ✅ New columns have NOT NULL defaults; old code ignores them
- ✅ Foreign keys to organization are optional initially (set NULL if org deleted)
- ✅ Existing queries on facilitator tables remain unchanged

If rollback needed:
```sql
-- Drop new tables (old code won't reference them)
DROP TABLE IF EXISTS facilitator.organization_member;
DROP TABLE IF EXISTS facilitator.idempotency_response;
DROP TABLE IF EXISTS facilitator.api_audit_log;
DROP TABLE IF EXISTS facilitator.organization;

-- Drop new columns (old code ignores extra columns)
ALTER TABLE facilitator.api_key DROP COLUMN IF EXISTS scopes, created_by, expires_at, revoked_at, key_prefix;
ALTER TABLE facilitator.resource_server DROP COLUMN IF EXISTS organization_id;
```

## Testing

Run migrations:
```bash
bun run db:generate
bun run db:push
```

Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'facilitator' 
ORDER BY table_name;
```

Expected tables:
- api_key ✓
- api_audit_log ✓
- idempotency_response ✓
- organization ✓
- organization_member ✓
- payment_verification ✓ (existing)
- resource_server ✓ (modified)
- settlement ✓ (existing)
