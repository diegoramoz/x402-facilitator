/**
 * x402 Public API Integration Tests
 *
 * Tests for payment verification and settlement endpoints
 * Location: /api/v2/*
 */

import { describe, expect, it } from "bun:test";

/**
 * Test Configuration
 */
const API_BASE = "https://x402.localhost/api/v2";
const API_KEY = "test_key_placeholder"; // Would be replaced with actual key in real tests

/**
 * Test Utilities
 */
async function callPublicAPI(
	procedure: string,
	input: Record<string, any>,
	headers: Record<string, string> = {}
) {
	const defaultHeaders = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${API_KEY}`,
		...headers,
	};

	const response = await fetch(`${API_BASE}/${procedure}`, {
		method: "POST",
		headers: defaultHeaders,
		body: JSON.stringify(input),
	});

	const data = await response.json();
	return { status: response.status, data };
}

/**
 * Test Data
 */
const validPaymentDetails = {
	amount: "1000000", // 1 USDC (6 decimals)
	currency: "USDC",
	networkId: "base",
};

const validPaymentPayload = {
	amount: "1000000",
	signature: `0x${"a".repeat(130)}`, // Dummy signature
	timestamp: Date.now(),
	clientAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
};

const testVerificationInput = {
	paymentDetails: validPaymentDetails,
	paymentPayload: validPaymentPayload,
};

/**
 * Test Suite: Verification Endpoint
 */
describe("POST /verify - Payment Verification", () => {
	it("should accept valid payment verification request", async () => {
		const { status, data } = await callPublicAPI(
			"verify",
			testVerificationInput
		);

		expect(status).toBe(200);
		expect(data).toHaveProperty("result");
		expect(data.result).toHaveProperty("verificationId");
		expect(data.result).toHaveProperty("isValid");
		expect(data.result).toHaveProperty("timestamp");
	});

	it("should validate required payload fields", async () => {
		const invalidInput = {
			paymentDetails: validPaymentDetails,
			paymentPayload: {
				// Missing signature and timestamp
				amount: "1000000",
			},
		};

		const { status } = await callPublicAPI("verify", invalidInput);

		expect(status).toBeGreaterThanOrEqual(400);
	});

	it("should reject mismatched amounts", async () => {
		const mismatchInput = {
			paymentDetails: {
				...validPaymentDetails,
				amount: "2000000", // Different amount
			},
			paymentPayload: validPaymentPayload, // Original amount
		};

		const { status } = await callPublicAPI("verify", mismatchInput);

		expect(status).toBeGreaterThanOrEqual(400);
	});

	it("should reject stale timestamps", async () => {
		const staleInput = {
			paymentDetails: validPaymentDetails,
			paymentPayload: {
				...validPaymentPayload,
				timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes old
			},
		};

		const { status } = await callPublicAPI("verify", staleInput);

		expect(status).toBeGreaterThanOrEqual(400);
	});
});

/**
 * Test Suite: Settlement Endpoint
 */
describe("POST /settle - Payment Settlement", () => {
	it("should accept valid settlement request", async () => {
		// First verify a payment
		const verifyRes = await callPublicAPI("verify", testVerificationInput);
		const verificationId = verifyRes.data.result.verificationId;

		// Then settle it
		const settleInput = {
			verificationId,
			paymentDetails: validPaymentDetails,
			paymentPayload: validPaymentPayload,
		};

		const { status, data } = await callPublicAPI("settle", settleInput);

		expect(status).toBe(200);
		expect(data).toHaveProperty("result");
		expect(data.result).toHaveProperty("settlementId");
		expect(data.result).toHaveProperty("status");
	});

	it("should require verificationId", async () => {
		const invalidInput = {
			// Missing verificationId
			paymentDetails: validPaymentDetails,
			paymentPayload: validPaymentPayload,
		};

		const { status } = await callPublicAPI("settle", invalidInput);

		expect(status).toBeGreaterThanOrEqual(400);
	});
});

/**
 * Test Suite: Status Query Endpoints
 */
describe("GET /status/verification/:id - Verification Status", () => {
	it("should return verification status", async () => {
		// First create a verification
		const verifyRes = await callPublicAPI("verify", testVerificationInput);
		const verificationId = verifyRes.data.result.verificationId;

		// Then query status
		const { status, data } = await callPublicAPI(
			`status/verification/${verificationId}`,
			{}
		);

		expect(status).toBe(200);
		expect(data).toHaveProperty("result");
		expect(data.result.verificationId).toBe(verificationId);
	});
});

describe("GET /status/settlement/:id - Settlement Status", () => {
	it("should return settlement status", async () => {
		// First create settlement
		const verifyRes = await callPublicAPI("verify", testVerificationInput);
		const verificationId = verifyRes.data.result.verificationId;

		const settleInput = {
			verificationId,
			paymentDetails: validPaymentDetails,
			paymentPayload: validPaymentPayload,
		};

		const settleRes = await callPublicAPI("settle", settleInput);
		const settlementId = settleRes.data.result.settlementId;

		// Query status
		const { status, data } = await callPublicAPI(
			`status/settlement/${settlementId}`,
			{}
		);

		expect(status).toBe(200);
		expect(data).toHaveProperty("result");
		expect(data.result.settlementId).toBe(settlementId);
	});
});

/**
 * Test Suite: Discovery Endpoint
 */
describe("GET /supported - Discovery", () => {
	it("should return supported networks without authentication", async () => {
		const response = await fetch(`${API_BASE}/supported`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe(
			"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400"
		);

		const data = await response.json();
		expect(data).toHaveProperty("kinds");
		expect(data).toHaveProperty("signers");
		expect(data).toHaveProperty("extensions");
	});
});

/**
 * Test Suite: Error Handling
 */
describe("Error Handling", () => {
	it("should require API key authentication", async () => {
		const { status } = await callPublicAPI(
			"verify",
			testVerificationInput,
			{ Authorization: "" } // Missing key
		);

		expect(status).toBe(401);
	});

	it("should return error in standard format", async () => {
		const invalidInput = { invalid: "data" };

		const { data } = await callPublicAPI("verify", invalidInput);

		expect(data).toHaveProperty("error");
		expect(data.error).toHaveProperty("code");
		expect(data).toHaveProperty("requestId");
		expect(data).toHaveProperty("timestamp");
	});
});

/**
 * Test Suite: OpenAPI Contract
 */
describe("OpenAPI Schema", () => {
	it("should generate OpenAPI spec at /openapi.json", async () => {
		const response = await fetch(`${API_BASE}/openapi.json`, {
			headers: {
				Authorization: `Bearer ${API_KEY}`,
			},
		});

		expect(response.status).toBe(200);

		const spec = await response.json();
		expect(spec).toHaveProperty("openapi");
		expect(spec).toHaveProperty("info");
		expect(spec).toHaveProperty("paths");
		expect(spec.paths).toHaveProperty("/verify");
		expect(spec.paths).toHaveProperty("/settle");
	});

	it("should include proper schema definitions", async () => {
		const response = await fetch(`${API_BASE}/openapi.json`, {
			headers: {
				Authorization: `Bearer ${API_KEY}`,
			},
		});

		const spec = await response.json();

		// Verify verify endpoint
		const verifyPath = spec.paths["/verify"];
		expect(verifyPath).toHaveProperty("post");
		expect(verifyPath.post).toHaveProperty("requestBody");
		expect(verifyPath.post).toHaveProperty("responses");

		// Verify settle endpoint
		const settlePath = spec.paths["/settle"];
		expect(settlePath).toHaveProperty("post");
	});
});
