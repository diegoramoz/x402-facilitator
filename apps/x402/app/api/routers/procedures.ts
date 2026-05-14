import { ORPCError, os } from "@orpc/server";
import { auth } from "@ramoz/auth";
import type { NextRequest } from "next/server";

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
