import crypto from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Idempotency Key Enforcement
 *
 * Requires Idempotency-Key header on POST endpoints.
 * Scope: (apiKeyId, route, bodyHash)
 *
 * Behavior:
 * - First request with key: execute and cache response
 * - Retry with same key + body: return cached response
 * - Retry with same key + different body: return 409 Conflict
 * - GET requests: naturally idempotent, no header required
 *
 * Cache TTL: 24 hours
 */

export type IdempotencyRecord = {
	id: string;
	apiKeyId: string;
	route: string;
	bodyHash: string;
	idempotencyKey: string;
	requestBody: string;
	responseStatus: number;
	responseBody: string;
	createdAt: Date;
	expiresAt: Date;
};

/**
 * Compute SHA-256 hash of request body
 */
export function hashBody(body: string): string {
	return crypto.createHash("sha256").update(body).digest("hex");
}

/**
 * Check if request is idempotent (GET)
 */
export function isIdempotentMethod(method: string): boolean {
	return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

/**
 * Validate and check idempotency key
 *
 * TODO: Implement in Phase 4
 * 1. Extract Idempotency-Key header
 * 2. Parse request body
 * 3. Hash body
 * 4. Query idempotency_response table
 * 5. If found with same body hash: return cached response
 * 6. If found with different body hash: return 409
 * 7. If not found: allow request to proceed, cache response after
 */
export function checkIdempotency(
	req: NextRequest,
	apiKeyId: string,
	route: string,
	bodyText: string
): Promise<{
	isIdempotent: boolean;
	cachedResponse: NextResponse | null;
	bodyHash: string;
	idempotencyKey: string | null;
} | null> {
	// GET requests don't need idempotency key
	if (isIdempotentMethod(req.method)) {
		return {
			isIdempotent: true,
			cachedResponse: null,
			bodyHash: "",
			idempotencyKey: null,
		};
	}

	const idempotencyKey = req.headers.get("idempotency-key");
	if (!idempotencyKey) {
		throw new Error(
			"BAD_REQUEST: Missing Idempotency-Key header for POST/PUT/PATCH"
		);
	}

	const bodyHash = hashBody(bodyText);

	// TODO: Query database for existing idempotency record
	// If found with same body hash: return cached response
	// If found with different body hash: throw 409 error
	// If not found: return null (allow request to proceed)

	return {
		isIdempotent: false,
		cachedResponse: null,
		bodyHash,
		idempotencyKey,
	};
}

/**
 * Store idempotency response for future retries
 *
 * TODO: Implement in Phase 4
 */
export async function storeIdempotencyResponse(
	apiKeyId: string,
	route: string,
	bodyHash: string,
	idempotencyKey: string,
	requestBody: string,
	responseStatus: number,
	responseBody: string
): Promise<void> {
	// TODO: Insert into idempotency_response table
	// TTL: 24 hours from now
}
