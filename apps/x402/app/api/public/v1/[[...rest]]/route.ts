/**
 * x402 Public API v1
 *
 * Route: /api/public/v1/*
 *
 * Public API for payment verification and settlement
 * Requires: API key authentication
 */

import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { NextRequest } from "next/server";
import { createPublicContext } from "../../../routers/procedures";
import { publicRouter } from "../../../routers/public";

/**
 * Create unified router for public API
 */
const appRouter = {
	verify: publicRouter.verify,
	settle: publicRouter.settle,
	getVerificationStatus: publicRouter.getVerificationStatus,
	getSettlementStatus: publicRouter.getSettlementStatus,
};

/**
 * RPC Handler: Processes requests to /api/public/v1/[procedure]
 */
const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error("[Public API] RPC Error:", error);
		}),
	],
});

/**
 * OpenAPI Handler: Generates schema at /api/public/v1/openapi.json
 */
const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error("[Public API] OpenAPI Error:", error);
		}),
	],
});

/**
 * Main handler for all public API requests
 */
async function handleRequest(req: NextRequest) {
	try {
		const context = createPublicContext(req);

		// Check for OpenAPI spec request
		if (
			req.nextUrl.pathname === "/api/public/v1/openapi.json" ||
			req.nextUrl.pathname.endsWith("/openapi.json")
		) {
			const apiResult = await apiHandler.handle(req, {
				prefix: "/api/public/v1",
				context,
			});
			if (apiResult.response) {
				return apiResult.response;
			}
		}

		// Handle RPC procedure calls
		const rpcResult = await rpcHandler.handle(req, {
			prefix: "/api/public/v1",
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
		console.error("[Public API] Unhandled Error:", error);
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
