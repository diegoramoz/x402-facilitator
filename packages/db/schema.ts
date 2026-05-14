import { textField } from "@ramoz/shared/allowed-chars";
import { relations } from "drizzle-orm/_relations";
import {
	bigint,
	boolean,
	index,
	integer,
	json,
	pgEnum,
	snakeCase,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { myNanoid, NANO_ID_LENGTH } from "./constants";

// ─── DANGER: AUTH TABLES — DO NOT MODIFY ──────────────────────────────────────
// These tables are managed by better-auth. Changing column names, types, or
// removing columns will break authentication. Add new columns only via
// better-auth's `additionalFields` config and re-running `db:push`.

export const userRoles = pgEnum("user_roles", ["admin", "user"]);

export type UserRoles = (typeof userRoles.enumValues)[number];

export const user = snakeCase.table("user", {
	// Internal bigint PK — never exposed to clients.
	id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
	nanoId: varchar({ length: NANO_ID_LENGTH })
		.$defaultFn(() => myNanoid())
		.notNull()
		.unique(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	role: userRoles().notNull().default("user"),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = snakeCase.table(
	"session",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		token: text().notNull().unique(),
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp({ withTimezone: true })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text(),
		userAgent: text(),
		userId: bigint({ mode: "bigint" })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(t) => [index("session_userId_idx").on(t.userId)]
);

export const account = snakeCase.table(
	"account",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: bigint({ mode: "bigint" })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		accessTokenExpiresAt: timestamp({
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp({
			withTimezone: true,
		}),
		scope: text(),
		password: text(),
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => [index("account_userId_idx").on(t.userId)]
);

export const verification = snakeCase.table(
	"verification",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		createdAt: timestamp({ withTimezone: true }).defaultNow(),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)]
);

// passkey table required by @better-auth/passkey plugin.
// Column names must match what better-auth expects exactly.
export const passkey = snakeCase.table(
	"passkey",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 255 }),
		publicKey: text().notNull(),
		userId: bigint({ mode: "bigint" })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		credentialID: text().notNull(),
		counter: integer().notNull(),
		deviceType: text().notNull(),
		backedUp: boolean().notNull(),
		transports: text(),
		createdAt: timestamp({ withTimezone: true }).defaultNow(),
		aaguid: text(),
	},
	(t) => [
		index("passkey_userId_idx").on(t.userId),
		index("passkey_credentialID_idx").on(t.credentialID),
	]
);

export const walletStatus = pgEnum("wallet_status", [
	"pending",
	"active",
	"failed",
]);

export type WalletStatus = (typeof walletStatus.enumValues)[number];

export const wallet = snakeCase.table(
	"wallet",
	{
		id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint({ mode: "bigint" })
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		walletId: varchar({ length: 36 }), // Circle UUID (nullable during pending)
		evmAddress: varchar({ length: 42 }), // 0x + 40 hex chars (nullable during pending)
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(t) => [index("wallet_userId_idx").on(t.userId)]
);

// ─── RELATIONS ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many, one }) => ({
	accounts: many(account),
	sessions: many(session),
	passkeys: many(passkey),
	wallet: one(wallet),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
	user: one(user, { fields: [passkey.userId], references: [user.id] }),
}));

export const walletRelations = relations(wallet, ({ one }) => ({
	user: one(user, { fields: [wallet.userId], references: [user.id] }),
}));

export const selectUserSchema = createSelectSchema(user);

export const insertUserSchema = createInsertSchema(user, {
	email: textField({
		chars: { preset: "email" },
		label: "Email",
		placeholder: "email@example.com",
	}).max(254, "Cannot exceed 254 characters"),
}).strict();

export const selectWalletSchema = createSelectSchema(wallet);

export const insertWalletSchema = createInsertSchema(wallet).pick({
	userId: true,
});

// ─── X402 EXTENSIONS ──────────────────────────────────────────────────────
// Import and re-export x402 multi-tenant schema extensions
/**
 * x402 Schema Extensions for Multi-Tenant Foundation
 *
 * These tables extend the facilitator schema with multi-tenant support,
 * idempotency caching, and audit logging capabilities.
 *
 * Designed to be imported and included in the main schema export.
 */

// ─── NEW TABLES FOR X402 ──────────────────────────────────────────────────

/**
 * Organization: Tenant boundary for multi-tenant v1 foundation
 */
export const organization = snakeCase.table(
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
export const organizationMember = snakeCase.table(
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
export const idempotencyResponse = snakeCase.table(
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
export const apiAuditLog = snakeCase.table(
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

export default {
	user,
	account,
	session,
	verification,
	passkey,
	wallet,
	apiAuditLog,
	apiAuditLogRelations,
	idempotencyResponse,
	organization,
	organizationMember,
	organizationMemberRelations,
	organizationRelations,
};
