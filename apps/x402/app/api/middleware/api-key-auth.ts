import type { NextRequest } from "next/server";

/**
 * API Key Authentication Middleware
 *
 * Extracts and validates API key from Authorization header
 * Format: Bearer x402_live_<128-char-secret>
 *
 * Returns: { id, resourceServerId, organizationId, scopes, expiresAt, revokedAt }
 * Throws: Error with "UNAUTHORIZED" code if invalid
 */
export type ApiKeyData = {
	id: string;
	prefix: string;
	resourceServerId: string;
	organizationId: string;
	scopes: string[];
	expiresAt: Date | null;
	revokedAt: Date | null;
};

const regex = /^Bearer\s+(.+)$/i;

export function validateApiKey(req: NextRequest) {
	const authHeader = req.headers.get("authorization") || "";

	// Parse "Bearer <token>" format
	const match = authHeader.match(regex);
	if (!match) {
		return null;
	}

	// const token = match[1];

	// TODO: Implement API key validation (Phase 4)
	// 1. Extract prefix from token (first part)
	// 2. Query api_key table by prefix
	// 3. bcrypt.compare(token, hash)
	// 4. Check if expired or revoked
	// 5. Update lastUsedAt
	// 6. Return key data or throw error

	// Placeholder: reject all for now
	return null;
}

/**
 * Scope validation helper
 * Check if API key has required scope
 */
export function checkScope(apiKey: ApiKeyData, requiredScope: string): boolean {
	return apiKey.scopes.includes(requiredScope);
}

export function assertScope(apiKey: ApiKeyData, requiredScope: string): void {
	if (!checkScope(apiKey, requiredScope)) {
		throw new Error(`FORBIDDEN: Missing scope '${requiredScope}'`);
	}
}
