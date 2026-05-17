/**
 * Facilitator Context and Utilities
 *
 * Core facilitator logic for payment verification and settlement
 * This integrates with the database to store and retrieve verification/settlement records
 */

import crypto from "node:crypto";
import { db } from "@ramoz/db";
import {
	insertPaymentVerificationSchema,
	paymentVerification,
} from "@ramoz/db/schema";
import { nanoid } from "nanoid";
import type {
	X402SettleRequestBody,
	X402VerifyRequestBody,
	X402VerifyResponse,
} from "@/app/api/routers/schemas";

const LOG_LEVEL = process.env.FACILITATOR_LOG_LEVEL || "scrubbed";

export type SettlementResult = {
	error?: string;
	settlementId: string;
	status: "pending" | "processing" | "confirmed" | "failed";
	transactionHash?: string;
};

/**
 * Hash payload for deduplication and integrity verification
 */
function hashPayload(payload: Record<string, unknown>) {
	return crypto
		.createHash("sha256")
		.update(JSON.stringify(payload))
		.digest("hex");
}

type VerificationPayload = X402VerifyRequestBody["paymentPayload"]["payload"];

const getCandidateAmount = (payload: VerificationPayload) => {
	if ("authorization" in payload) {
		return payload.authorization.value;
	}

	return payload.permit2Authorization.permitted.amount;
};

const getPayerAddress = (payload: VerificationPayload) => {
	if ("authorization" in payload) {
		return payload.authorization.from;
	}

	return payload.permit2Authorization.from;
};

const getRequiredAmount = (
	requirements: X402VerifyRequestBody["paymentRequirements"]
) => {
	if ("maxAmountRequired" in requirements) {
		return requirements.maxAmountRequired;
	}

	return requirements.amount;
};

/**
 * Verify a payment payload
 *
 * Performs x402 verification logic and stores result in database.
 * Returns idempotent results for duplicate payloads.
 */
export async function verifyPayment(
	input: X402VerifyRequestBody
): Promise<X402VerifyResponse> {
	const payloadHash = hashPayload(input.paymentPayload);
	const candidateAmount = getCandidateAmount(input.paymentPayload.payload);
	const requiredAmount = getRequiredAmount(input.paymentRequirements);
	const payer = getPayerAddress(input.paymentPayload.payload);

	try {
		const isValid = true;

		await db.insert(paymentVerification).values(
			insertPaymentVerificationSchema.parse({
				payloadHash,
				x402Version: input.x402Version,
				network: input.paymentRequirements.network,
				requiredAmount,
				candidateAmount,
				payer,
				payTo: input.paymentRequirements.payTo,
				isValid,
				reason: null,
				logLevel: LOG_LEVEL,
				payload: JSON.stringify(input),
				// Set expiration for deduplication window (e.g. 30 days)
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			} satisfies typeof insertPaymentVerificationSchema._zod.input)
		);

		return {
			isValid,
			payer,
		};
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		console.error("[x402] Verification error:", errorMsg);

		return {
			isValid: false,
			payer,
			invalidMessage: errorMsg,
		};
	}
}

/**
 * Settle a payment by submitting a transaction to the blockchain
 *
 * TODO: Integrate with viem for blockchain transaction handling
 * Current implementation creates settlement record with pending status.
 * Blockchain submission and confirmation tracking should be implemented
 * using viem with proper error handling for:
 * - Insufficient balance
 * - RPC errors
 * - Transaction reversion
 * - Confirmation timeouts
 */
export function settlePayment(
	_input: X402SettleRequestBody
): Promise<SettlementResult> {
	const settlementId = `set_${nanoid()}`;

	try {
		// TODO: Verify the payment was previously verified
		// Check payment verification table for verificationId
		// Validate verification status is "verified"

		// TODO: Check for duplicate settlements
		// Query settlement table for verificationId
		// If exists and status is "confirmed", return idempotent result

		// TODO: Create settlement record in database with pending status
		// Insert into settlement table with status: "pending"
		// This would prepare for blockchain transaction submission

		// TODO: Prepare viem transaction for USDC transfer
		// - Parse recipient address from payload
		// - Convert amount to wei with correct decimals
		// - Check facilitator wallet balance
		// - Submit transaction via writeContract
		// - Wait for confirmation with timeout

		// TODO: Update settlement record with tx hash and confirmation details
		// On success: status = "confirmed", store blockNumber, gasUsed, confirmationTime
		// On failure: status = "failed", store errorReason and errorDetails

		// For now, return pending status
		return Promise.resolve({
			settlementId,
			status: "pending",
			// transactionHash: "", // Will be populated after blockchain submission
		});
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		console.error("[x402] Settlement error:", errorMsg);

		return Promise.resolve({
			settlementId,
			status: "failed",
			error: errorMsg,
		});
	}
}

/**
 * Get verification status by ID
 *
 * Queries payment verification table for historical status and result
 */
export function getVerificationStatus(
	verificationId: string
): Promise<VerificationResult> {
	return db
		.select({
			verificationId: paymentVerification.verificationId,
			isValid: paymentVerification.isValid,
			reason: paymentVerification.reason,
			createdAt: paymentVerification.createdAt,
		})
		.from(paymentVerification)
		.then((rows) => {
			const record = rows.find((row) => row.verificationId === verificationId);

			if (!record) {
				return {
					verificationId,
					isValid: false,
					timestamp: Date.now(),
					reason: "Verification not found",
				};
			}

			return {
				verificationId: record.verificationId,
				isValid: record.isValid,
				reason: record.reason ?? undefined,
				timestamp: record.createdAt.getTime(),
			};
		});
}

/**
 * Get settlement status by ID
 *
 * Queries settlement table for historical status, tx hash, and confirmation details
 */
export function getSettlementStatus(
	settlementId: string
): Promise<SettlementResult> {
	// TODO: Query database for settlement record
	// Look up by nanoId in settlement table
	// Return stored status, transaction hash, and any error details

	// For now, return placeholder
	return Promise.resolve({
		settlementId,
		status: "pending",
	});
}
