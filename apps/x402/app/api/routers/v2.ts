import { z } from "zod";
import { publicProcedure } from "@/app/api/routers/procedures";
import {
	getSettlementStatus as getFacilitatorSettlementStatus,
	getVerificationStatus as getFacilitatorVerificationStatus,
	settlePayment,
	verifyPayment,
} from "@/utils/facilitator";

/**
 * Public Router - Payment Verification and Settlement
 *
 * Endpoints:
 * - POST /api/v2/verify - Verify payment signature
 * - POST /api/v2/settle - Submit settlement to blockchain
 * - GET /api/v2/status/verification/:id - Check verification status
 * - GET /api/v2/status/settlement/:id - Check settlement status
 */

// ===== Input Schemas =====

const PaymentDetailsInput = z.object({
	amount: z.string().describe("Amount in wei"),
	currency: z.string().describe("Currency code (e.g., USDC)"),
	networkId: z.string().describe("Blockchain network (e.g., base)"),
});

const PaymentPayloadInput = z.object({
	amount: z.string().describe("Amount in wei"),
	signature: z.string().describe("Cryptographic signature"),
	timestamp: z.number().describe("Unix timestamp"),
	clientAddress: z.string().optional().describe("Client EVM address"),
	nonce: z.string().optional().describe("Transaction nonce"),
});

// ===== Procedures =====

/**
 * Verify a payment signature
 */
const verify = publicProcedure
	.input(
		z.object({
			paymentDetails: PaymentDetailsInput,
			paymentPayload: PaymentPayloadInput,
		})
	)
	.handler(async ({ input }) =>
		verifyPayment({
			paymentDetails: input.paymentDetails,
			paymentPayload: input.paymentPayload,
		})
	);

/**
 * Submit a settlement to blockchain
 */
const settle = publicProcedure
	.input(
		z.object({
			verificationId: z.string(),
			paymentDetails: PaymentDetailsInput,
			paymentPayload: PaymentPayloadInput,
		})
	)
	.handler(async ({ input }) =>
		settlePayment({
			verificationId: input.verificationId,
			paymentDetails: input.paymentDetails,
			paymentPayload: input.paymentPayload,
		})
	);

/**
 * Get verification status
 */
const getVerificationStatus = publicProcedure
	.input(z.object({ verificationId: z.string() }))
	.handler(async ({ input }) =>
		getFacilitatorVerificationStatus(input.verificationId)
	);

/**
 * Get settlement status
 */
const getSettlementStatus = publicProcedure
	.input(z.object({ settlementId: z.string() }))
	.handler(async ({ input }) =>
		getFacilitatorSettlementStatus(input.settlementId)
	);

/**
 * Export public router
 */
export const publicRouter = {
	verify,
	settle,
	getVerificationStatus,
	getSettlementStatus,
};

export type PublicRouter = typeof publicRouter;
