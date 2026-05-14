-- x402 Merge Foundation Migration
-- Adds multi-tenant tables and extends API key model for x402 unified app
-- All changes are additive-only for backward compatibility

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- Organization: Tenant boundary for multi-tenant foundation
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

CREATE INDEX IF NOT EXISTS organization_nano_id_idx ON facilitator.organization(nano_id);
CREATE INDEX IF NOT EXISTS organization_slug_idx ON facilitator.organization(slug);

-- Organization Member: Assign users to organizations
CREATE TABLE IF NOT EXISTS facilitator.organization_member (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nano_id varchar(21) NOT NULL UNIQUE,
  organization_id bigint NOT NULL REFERENCES facilitator.organization(id) ON DELETE CASCADE,
  user_id bigint NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL DEFAULT 'developer',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_member_org_user_unique UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_member_organization_id_idx ON facilitator.organization_member(organization_id);
CREATE INDEX IF NOT EXISTS organization_member_user_id_idx ON facilitator.organization_member(user_id);
CREATE INDEX IF NOT EXISTS organization_member_nano_id_idx ON facilitator.organization_member(nano_id);

-- Idempotency Response: Cache for Idempotency-Key header enforcement
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

CREATE INDEX IF NOT EXISTS idempotency_response_api_key_id_idx ON facilitator.idempotency_response(api_key_id);
CREATE INDEX IF NOT EXISTS idempotency_response_idempotency_key_idx ON facilitator.idempotency_response(idempotency_key);
CREATE INDEX IF NOT EXISTS idempotency_response_request_hash_idx ON facilitator.idempotency_response(request_hash);
CREATE INDEX IF NOT EXISTS idempotency_response_expires_at_idx ON facilitator.idempotency_response(expires_at);

-- API Audit Log: Optional audit trail for admin dashboard
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

CREATE INDEX IF NOT EXISTS api_audit_log_organization_id_idx ON facilitator.api_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS api_audit_log_created_at_idx ON facilitator.api_audit_log(created_at);

-- ============================================================================
-- COLUMN ADDITIONS TO EXISTING TABLES
-- ============================================================================

-- Extend facilitator.api_key for scopes, expiry, and multi-tenant support
ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS scopes text;
-- Format: "verify:payment,settle:payment,read:status" (comma-separated)

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS created_by bigint REFERENCES public."user"(id) ON DELETE SET NULL;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone;

ALTER TABLE facilitator.api_key ADD COLUMN IF NOT EXISTS key_prefix varchar(50);
-- Format: "x402_live_abc123" for faster prefix-based lookups

CREATE INDEX IF NOT EXISTS api_key_key_prefix_idx ON facilitator.api_key(key_prefix);
CREATE INDEX IF NOT EXISTS api_key_expires_at_idx ON facilitator.api_key(expires_at);
CREATE INDEX IF NOT EXISTS api_key_revoked_at_idx ON facilitator.api_key(revoked_at);

-- Extend facilitator.resource_server for multi-tenant ownership
ALTER TABLE facilitator.resource_server ADD COLUMN IF NOT EXISTS organization_id bigint REFERENCES facilitator.organization(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS resource_server_organization_id_idx ON facilitator.resource_server(organization_id);
