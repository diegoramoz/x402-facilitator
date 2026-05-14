import { NextResponse } from "next/server";
import z from "zod/v4";

/**
 * Rate Limiting by API Key using Token Bucket Algorithm
 *
 * Limits per endpoint:
 * - verify: 60 req/min
 * - settle: 30 req/min
 * - status: 120 req/min
 *
 * Token bucket with burst allowance.
 * Returns 429 Too Many Requests with Retry-After header if exceeded.
 *
 * In-memory implementation (single-server v1).
 * For multi-server: implement with Redis.
 */

type RateLimitBucket = {
	tokens: number;
	lastRefillAt: number;
};

// In-memory storage: apiKeyId -> route -> bucket
const rateLimitBuckets = new Map<string, Map<string, RateLimitBucket>>();

const RATE_LIMITS: Record<
	string,
	{ requestsPerMin: number; burstTokens: number }
> = {
	verify: { requestsPerMin: 60, burstTokens: 10 },
	settle: { requestsPerMin: 30, burstTokens: 5 },
	getVerificationStatus: { requestsPerMin: 120, burstTokens: 20 },
	getSettlementStatus: { requestsPerMin: 120, burstTokens: 20 },
	createResourceServer: { requestsPerMin: 10, burstTokens: 2 },
	createApiKey: { requestsPerMin: 20, burstTokens: 3 },
	listApiKeys: { requestsPerMin: 120, burstTokens: 20 },
};

/**
 * Check rate limit for API key on endpoint
 *
 * Returns:
 * - { allowed: true } if within limit
 * - { allowed: false, retryAfterSeconds: number } if exceeded
 */
export function checkRateLimit(
	apiKeyId: string,
	procedureName: string
): { allowed: boolean; retryAfterSeconds?: number } {
	const limit = RATE_LIMITS[procedureName];
	if (!limit) {
		// No limit defined, allow
		return { allowed: true };
	}

	const now = Date.now();
	const refillRate = limit.requestsPerMin / 60; // tokens per second
	const maxTokens = limit.burstTokens + refillRate * 60; // capacity

	// Get or create bucket for this key
	if (!rateLimitBuckets.has(apiKeyId)) {
		rateLimitBuckets.set(apiKeyId, new Map());
	}

	const keyBuckets_ = rateLimitBuckets.get(apiKeyId);
	const keyBuckets = z
		.map(z.string(), z.object({ tokens: z.number(), lastRefillAt: z.number() }))
		.parse(keyBuckets_);
	let bucket = keyBuckets.get(procedureName);

	if (!bucket) {
		// Initialize bucket with full tokens
		bucket = {
			tokens: maxTokens,
			lastRefillAt: now,
		};
		keyBuckets.set(procedureName, bucket);
	}

	// Refill tokens based on time elapsed
	const secondsElapsed = (now - bucket.lastRefillAt) / 1000;
	bucket.tokens = Math.min(
		maxTokens,
		bucket.tokens + refillRate * secondsElapsed
	);
	bucket.lastRefillAt = now;

	// Try to consume a token
	if (bucket.tokens >= 1) {
		bucket.tokens -= 1;
		return { allowed: true };
	}

	// Exceeded - calculate retry after
	const tokensNeeded = 1 - bucket.tokens;
	const retryAfterSeconds = Math.ceil(tokensNeeded / refillRate);

	return {
		allowed: false,
		retryAfterSeconds,
	};
}

/**
 * Create 429 Too Many Requests response with Retry-After header
 */
export function createRateLimitResponse(
	retryAfterSeconds: number
): NextResponse {
	return new NextResponse(
		JSON.stringify({
			error: {
				code: "RATE_LIMITED",
				message: "Too many requests",
			},
			requestId: crypto.randomUUID(),
			timestamp: Date.now(),
		}),
		{
			status: 429,
			headers: {
				"Retry-After": retryAfterSeconds.toString(),
				"Content-Type": "application/json",
			},
		}
	);
}

/**
 * Clear rate limit bucket (for testing)
 */
export function clearRateLimits(): void {
	rateLimitBuckets.clear();
}
