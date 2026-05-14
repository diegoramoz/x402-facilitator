import { z } from "zod";
import { protectedProcedure } from "./procedures";

/**
 * Admin Router - Resource Server and API Key Management
 *
 * Requires:
 * - Valid session (better-auth passkey auth)
 * - Admin role (all users have admin access in v1)
 */

// ===== Resource Server Procedures =====

const createResourceServer = protectedProcedure
	.input(
		z.object({
			name: z.string().min(1).max(255),
			description: z.string().optional(),
			webhookUrl: z.url().optional(),
		})
	)
	.handler(({ input, context }) => {
		// TODO: Implement in Phase 5
		return {
			id: `rs_${crypto.randomUUID()}`,
			nanoId: `rs_${Math.random().toString(36).slice(2, 9)}`,
			name: input.name,
			description: input.description,
			organizationId: context.organizationId,
			createdAt: new Date(),
		};
	});

const listResourceServers = protectedProcedure.handler(() => {
	// TODO: Implement in Phase 5
	return [];
});

const getResourceServer = protectedProcedure
	.input(z.object({ id: z.string() }))
	.handler(({ input }) => {
		// TODO: Implement in Phase 5
		return {
			id: input.id,
			nanoId: "rs_abc123",
			name: "My Server",
			createdAt: new Date(),
			apiKeys: [],
		};
	});

// ===== API Key Procedures =====

const createApiKey = protectedProcedure
	.input(
		z.object({
			resourceServerId: z.string(),
			scopes: z.array(z.string()),
			expiresInDays: z.number().optional().default(90),
			name: z.string().optional(),
		})
	)
	.handler(({ input }) => {
		// TODO: Implement in Phase 5
		const secret = `x402_live_${crypto.getRandomValues(new Uint8Array(64)).toString()}`;

		return {
			id: `key_${crypto.randomUUID()}`,
			nanoId: "key_abc123",
			secret,
			prefix: "x402_live_abc1",
			scopes: input.scopes,
			expiresAt: new Date(
				Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000
			),
			createdAt: new Date(),
		};
	});

const listApiKeys = protectedProcedure
	.input(z.object({ resourceServerId: z.string().optional() }))
	.handler(() => {
		// TODO: Implement in Phase 5
		return [];
	});

const revokeApiKey = protectedProcedure
	.input(z.object({ keyId: z.string() }))
	.handler(() => {
		// TODO: Implement in Phase 5
		return { success: true, revokedAt: new Date() };
	});

const rotateApiKey = protectedProcedure
	.input(z.object({ keyId: z.string() }))
	.handler(({ input }) => {
		// TODO: Implement in Phase 5
		const newSecret = `x402_live_${crypto.getRandomValues(new Uint8Array(64)).toString()}`;

		return {
			oldKeyId: input.keyId,
			newKeyId: `key_${crypto.randomUUID()}`,
			newSecret,
			newExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			transitionEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		};
	});

/**
 * Export admin router
 */
export const adminRouter = {
	createResourceServer,
	listResourceServers,
	getResourceServer,
	createApiKey,
	listApiKeys,
	revokeApiKey,
	rotateApiKey,
};

export type AdminRouter = typeof adminRouter;
