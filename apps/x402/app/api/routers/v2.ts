import { z } from "zod";
import { publicProcedure } from "@/app/api/routers/procedures";
import {
	x402SettleRequestBodySchema,
	x402VerifyRequestBodySchema,
} from "@/app/api/routers/schemas";
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

/**
 * Verify a payment signature
 */
const verify = publicProcedure
	.input(x402VerifyRequestBodySchema)
	.handler(async ({ input }) => verifyPayment(input));

/**
 * Submit a settlement to blockchain
 */
const settle = publicProcedure
	.input(x402SettleRequestBodySchema)
	.handler(async ({ input }) => settlePayment(input));

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
