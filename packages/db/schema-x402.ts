/**
 * x402 Schema Extensions for Multi-Tenant Foundation
 *
 * These tables extend the facilitator schema with multi-tenant support,
 * idempotency caching, and audit logging capabilities.
 *
 * Designed to be imported and included in the main schema export.
 */

import { relations } from "drizzle-orm/_relations";
import {
	bigint,
	index,
	integer,
	json,
	pgSchema,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { myNanoid, NANO_ID_LENGTH } from "./constants";

export const facilitatorSchema = pgSchema("facilitator");
// ─── NEW TABLES FOR X402 ──────────────────────────────────────────────────

/**
 * Organization: Tenant boundary for multi-tenant v1 foundation
 */
export const organization = facilitatorSchema.table(
	"organization",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		nanoId: varchar({ length: NANO_ID_LENGTH })
			.$defaultFn(() => myNanoid())
			.notNull()
			.unique(),
		name: varchar({ length: 255 }).notNull(),
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

/**
 * Organization Member: Assign users to organizations
 * Assumes public.user table exists from packages/db/schema.ts
 */
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
		userId: bigint({ mode: "bigint" }).notNull(),
		// References public.user(id) - not strongly typed due to schema separation
		// ON DELETE CASCADE managed via SQL
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

/**
 * Idempotency Response: Cache settle/verify responses for Idempotency-Key header
 *
 * Scope: (apiKeyId, route, bodyHash)
 * TTL: 24 hours
 */
export const idempotencyResponse = facilitatorSchema.table(
	"idempotency_response",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		nanoId: varchar({ length: NANO_ID_LENGTH })
			.$defaultFn(() => myNanoid())
			.notNull()
			.unique(),
		apiKeyId: bigint({ mode: "bigint" }).notNull(),
		// References facilitator.api_key(id) - managed via SQL migration
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

/**
 * API Audit Log: Optional audit trail for admin dashboard
 */
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
		actorUserId: bigint({ mode: "bigint" }),
		// References public.user(id) - managed via SQL migration
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

// ─── RELATIONS ────────────────────────────────────────────────────────────

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(organizationMember),
	auditLogs: many(apiAuditLog),
}));

export const organizationMemberRelations = relations(
	organizationMember,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationMember.organizationId],
			references: [organization.id],
		}),
	})
);

export const apiAuditLogRelations = relations(apiAuditLog, ({ one }) => ({
	organization: one(organization, {
		fields: [apiAuditLog.organizationId],
		references: [organization.id],
	}),
}));
