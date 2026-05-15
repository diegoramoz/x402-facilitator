import { ORPCError, os } from "@orpc/server";
import { auth } from "@ramoz/auth";
import { env } from "@ramoz/env/server";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

const BEARER_REGEX = /^Bearer\s+(.+)$/i;

export type PublicContext = {
	req: NextRequest;
	apiKey: {
		id: string;
		resourceServerId: string;
		organizationId: string;
		scopes: string[];
		expiresAt: Date | null;
		revokedAt: Date | null;
	} | null;
	requestId: string;
};

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type AdminContext = {
	req: NextRequest;
	session: Session | null;
	userId: string | null;
	organizationId: string | null;
	requestId: string;
};

/**
 * Create public context from NextRequest
 * Validates API key from Authorization header
 */
export function createPublicContext(req: NextRequest): PublicContext {
	const requestId = crypto.randomUUID();
	const authHeader = req.headers.get("authorization") ?? "";

	const apiKey: PublicContext["apiKey"] = null;

	// Parse "Bearer <token>" format
	const match = BEARER_REGEX.exec(authHeader);
	if (match) {
		// TODO: Validate and lookup API key from database (Phase 4)
		// For now, reject all to be safe
	}

	return {
		req,
		apiKey,
		requestId,
	};
}

/**
 * Create admin context from NextRequest
 * Validates session from better-auth
 */
export async function createAdminContext(
	req: NextRequest
): Promise<AdminContext> {
	const requestId = crypto.randomUUID();

	try {
		const session = await auth.api.getSession({ headers: req.headers });

		return {
			req,
			session,
			userId: session?.user?.id || null,
			organizationId: null, // TODO: Get from session context
			requestId,
		};
	} catch {
		return {
			req,
			session: null,
			userId: null,
			organizationId: null,
			requestId,
		};
	}
}

/**
 * Public oRPC procedures (API key auth)
 */
export const publicO = os.$context<PublicContext>();

const requireApiKey = publicO.middleware(({ context, next }) => {
	if (!context.apiKey) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({ context });
});

export const publicProcedure = publicO.use(requireApiKey);

const RATE_LIMIT_CONFIG_SCHEMA = z.object({
	keyPrefix: z.string().min(1),
	maxRequests: z.int().positive(),
	windowSeconds: z.int().positive(),
	blockSeconds: z.int().positive().default(60),
	timeoutMs: z.int().positive().max(5000).default(300),
	tooManyRequestsMessage: z
		.string()
		.min(1)
		.default("Too many requests for this endpoint"),
	serviceUnavailableMessage: z
		.string()
		.min(1)
		.default("Rate limiter unavailable"),
});

type RateLimitConfig = z.infer<typeof RATE_LIMIT_CONFIG_SCHEMA>;
type RateLimitConfigInput = z.input<typeof RATE_LIMIT_CONFIG_SCHEMA>;

const redis = new Redis({
	url: env.UPSTASH_REDIS_REST_URL,
	token: env.UPSTASH_REDIS_REST_TOKEN,
});

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error("Upstash rate limiter timeout"));
		}, timeoutMs);

		promise
			.then((value) => {
				clearTimeout(timeout);
				resolve(value);
			})
			.catch((error) => {
				clearTimeout(timeout);
				reject(error);
			});
	});
}

function getClientAddress(req: NextRequest): string {
	if (env.TRUST_PROXY_HEADERS !== "true") {
		return "unknown";
	}

	const forwardedFor = req.headers.get("x-forwarded-for");
	if (forwardedFor) {
		const [firstAddress] = forwardedFor.split(",");
		if (firstAddress?.trim()) {
			return firstAddress.trim();
		}
	}

	const realIp = req.headers.get("x-real-ip");
	if (realIp?.trim()) {
		return realIp.trim();
	}

	return "unknown";
}

function withRateLimitTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number
): Promise<T> {
	return withTimeout(promise, timeoutMs);
}

function getRateLimitKeys(config: RateLimitConfig, clientIp: string) {
	return {
		rateKey: `${config.keyPrefix}:rate:${clientIp}`,
		blockKey: `${config.keyPrefix}:block:${clientIp}`,
	};
}

export function createPublicRateLimitMiddleware(
	configInput: RateLimitConfigInput
) {
	const config = RATE_LIMIT_CONFIG_SCHEMA.parse(configInput);
	const windowMs = config.windowSeconds * 1000;

	return publicO.middleware(async ({ context, next }) => {
		const now = Date.now();
		const clientIp = getClientAddress(context.req);
		const userAgent = context.req.headers.get("user-agent") || "unknown-agent";
		const requestPath = context.req.nextUrl.pathname;
		const { rateKey, blockKey } = getRateLimitKeys(config, clientIp);

		try {
			const isBlocked = await withRateLimitTimeout(
				redis.get<string>(blockKey),
				config.timeoutMs
			);

			if (isBlocked) {
				console.warn("[Public API][rate-limit] blocked client", {
					requestId: context.requestId,
					clientIp,
					requestPath,
					policy: config.keyPrefix,
					userAgent,
				});

				throw new ORPCError("TOO_MANY_REQUESTS", {
					message: config.tooManyRequestsMessage,
				});
			}

			const windowStart = now - windowMs;
			const member = `${now}:${context.requestId}`;

			const result = await withRateLimitTimeout(
				redis
					.pipeline()
					.zremrangebyscore(rateKey, 0, windowStart)
					.zadd(rateKey, { score: now, member })
					.zcard(rateKey)
					.expire(rateKey, Math.ceil((windowMs * 2) / 1000))
					.exec(),
				config.timeoutMs
			);

			const requestCountResult = result[2];
			const requestCount =
				typeof requestCountResult === "number"
					? requestCountResult
					: Number(requestCountResult);

			if (!Number.isFinite(requestCount)) {
				throw new Error("Invalid Upstash rate limiter response");
			}

			if (requestCount <= config.maxRequests) {
				return next({ context });
			}

			await withRateLimitTimeout(
				redis.set(blockKey, "1", { ex: config.blockSeconds }),
				config.timeoutMs
			);

			console.warn("[Public API][rate-limit] abuse detected", {
				requestId: context.requestId,
				clientIp,
				requestPath,
				windowCount: requestCount,
				maxPerWindow: config.maxRequests,
				blockedForSeconds: config.blockSeconds,
				policy: config.keyPrefix,
				userAgent,
			});

			throw new ORPCError("TOO_MANY_REQUESTS", {
				message: config.tooManyRequestsMessage,
			});
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			console.error("[Public API][rate-limit] limiter unavailable", {
				requestId: context.requestId,
				clientIp,
				requestPath,
				policy: config.keyPrefix,
				error: error instanceof Error ? error.message : "unknown",
			});

			throw new ORPCError("SERVICE_UNAVAILABLE", {
				message: config.serviceUnavailableMessage,
			});
		}
	});
}

/**
 * Admin oRPC procedures (session auth)
 */
export const adminO = os.$context<AdminContext>();

const requireAuth = adminO.middleware(({ context, next }) => {
	if (!context.userId) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({ context });
});

export const protectedProcedure = adminO.use(requireAuth);
