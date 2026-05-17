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
import { x402Facilitator } from "@x402/core/facilitator";
import { ExactEvmScheme } from "@x402/evm/exact/facilitator";
import { UptoEvmScheme } from "@x402/evm/upto/facilitator";
import { arcTestnet, baseSepolia } from "viem/chains";
import type {
	X402SettleRequestBody,
	X402SettleResponse,
	X402VerifyRequestBody,
	X402VerifyResponse,
} from "@/app/api/routers/schemas";
import { generateEvmClient } from "@/utils/evm-client-factory";

const LOG_LEVEL = process.env.FACILITATOR_LOG_LEVEL || "scrubbed";

const baseSepoliaClient = generateEvmClient({ chain: baseSepolia.id });
const arcTestnetClient = generateEvmClient({ chain: arcTestnet.id });

const facilitator = new x402Facilitator();

facilitator.register(
	`eip155:${baseSepolia.id}`,
	new ExactEvmScheme(baseSepoliaClient, { deployERC4337WithEIP6492: true })
);
facilitator.register(
	`eip155:${arcTestnet.id}`,
	new ExactEvmScheme(arcTestnetClient, { deployERC4337WithEIP6492: true })
);
facilitator.register(
	`eip155:${baseSepolia.id}`,
	new UptoEvmScheme(baseSepoliaClient)
);
facilitator.register(
	`eip155:${arcTestnet.id}`,
	new UptoEvmScheme(arcTestnetClient)
);

export const supported = facilitator.getSupported();

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
 */
export async function verifyPayment(
	body: X402VerifyRequestBody
): Promise<X402VerifyResponse> {
	const payloadHash = hashPayload(body.paymentPayload);
	const candidateAmount = getCandidateAmount(body.paymentPayload.payload);
	const requiredAmount = getRequiredAmount(body.paymentRequirements);
	const payer = getPayerAddress(body.paymentPayload.payload);

	try {
		// Hooks will automatically:
		// - Track verified payment (onAfterVerify)
		// - Extract and catalog discovery info (onAfterVerify)
		const response = await facilitator.verify(
			body.paymentPayload,
			body.paymentRequirements
		);

		await db.insert(paymentVerification).values(
			insertPaymentVerificationSchema.parse({
				payloadHash,
				x402Version: body.x402Version,
				network: body.paymentRequirements.network,
				requiredAmount,
				candidateAmount,
				payer,
				payTo: body.paymentRequirements.payTo,
				isValid: response.isValid,
				reason: null,
				logLevel: LOG_LEVEL,
				payload: JSON.stringify(body),
				// Set expiration for deduplication window (e.g. 30 days)
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			} satisfies typeof insertPaymentVerificationSchema._zod.input)
		);

		return {
			payer,
			...response,
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
 */
export async function settlePayment(
	body: X402SettleRequestBody
): Promise<X402SettleResponse> {
	// const payloadHash = hashPayload(body.paymentPayload);
	const requiredAmount = getRequiredAmount(body.paymentRequirements);
	const payer = getPayerAddress(body.paymentPayload.payload);

	try {
		const facilitator = new x402Facilitator();

		// Verify payment
		const verifyResult = await facilitator.verify(
			body.paymentPayload,
			body.paymentRequirements
		);

		if (verifyResult.isValid) {
			const settleResult = await facilitator.settle(
				body.paymentPayload,
				body.paymentRequirements
			);
			console.log("Transaction:", settleResult.transaction);

			return {
				...settleResult,
				payer,
				amount: requiredAmount,
				network: body.paymentRequirements.network,
				success: true,
				transaction: settleResult.transaction,
			};
		}

		return {
			payer,
			network: body.paymentRequirements.network,
			success: false,
			amount: requiredAmount,
			transaction: "0x00",
		};
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		console.error("[x402] Settlement error:", errorMsg);

		return {
			network: body.paymentRequirements.network,
			payer,
			success: false,
			transaction: "0x00",
			errorMessage: errorMsg,
			amount: requiredAmount,
		};
	}
}
