/**
 * x402 Admin API
 *
 * Route: /api/admin/*
 *
 * Internal admin API for resource server and API key management
 * Requires: Session authentication (better-auth)
 */

import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { NextRequest } from "next/server";
import { adminRouter } from "@/app/api/routers/admin";
import { createAdminContext } from "@/app/api/routers/procedures";

/**
 * Create unified router for admin API
 */
const appRouter = {
	createResourceServer: adminRouter.createResourceServer,
	listResourceServers: adminRouter.listResourceServers,
	getResourceServer: adminRouter.getResourceServer,
	createApiKey: adminRouter.createApiKey,
	listApiKeys: adminRouter.listApiKeys,
	revokeApiKey: adminRouter.revokeApiKey,
	rotateApiKey: adminRouter.rotateApiKey,
};

/**
 * RPC Handler: Processes requests to /api/admin/[procedure]
 */
const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error("[Admin API] RPC Error:", error);
		}),
	],
});

/**
 * OpenAPI Handler: Generates schema at /api/admin/openapi.json (internal only)
 */
const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error("[Admin API] OpenAPI Error:", error);
		}),
	],
});

/**
 * Main handler for all admin API requests
 */
async function handleRequest(req: NextRequest) {
	try {
		const context = await createAdminContext(req);

		// Require authentication
		if (!context.userId) {
			return new Response(
				JSON.stringify({
					error: {
						code: "UNAUTHORIZED",
						message: "Authentication required",
					},
					requestId: context.requestId,
					timestamp: Date.now(),
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		// Check for OpenAPI spec request
		if (
			req.nextUrl.pathname === "/api/admin/openapi.json" ||
			req.nextUrl.pathname.endsWith("/openapi.json")
		) {
			const apiResult = await apiHandler.handle(req, {
				prefix: "/api/admin",
				context,
			});
			if (apiResult.response) {
				return apiResult.response;
			}
		}

		// Handle RPC procedure calls
		const rpcResult = await rpcHandler.handle(req, {
			prefix: "/api/admin",
			context,
		});
		if (rpcResult.response) {
			return rpcResult.response;
		}

		return new Response(
			JSON.stringify({
				error: {
					code: "NOT_FOUND",
					message: "Endpoint not found",
				},
				requestId: context.requestId,
				timestamp: Date.now(),
			}),
			{ status: 404, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("[Admin API] Unhandled Error:", error);
		return new Response(
			JSON.stringify({
				error: {
					code: "INTERNAL_SERVER_ERROR",
					message: "Internal server error",
				},
				requestId: crypto.randomUUID(),
				timestamp: Date.now(),
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

export const GET = handleRequest;
export const POST = handleRequest;
export const OPTIONS = handleRequest;
