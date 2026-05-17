import z from "zod/v4";
import { supportedNetworks } from "@/app/api/routers/chains";

const evmChecksumAddressRegex = /^0x[0-9a-fA-F]{40}$/;
const evmTransactionHashRegex = /^0x[0-9a-fA-F]{64}$/;
const eip712HexRegex = /^0x[0-9a-fA-F]{130,}$/;
const base58SolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const base58SolanaTransactionHash = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
const hashedNonceRegex = /^0x[0-9a-fA-F]{64}$/;
const numericNonceRegex = /^[0-9]+$/;
const unixTimestampRegex = /^[0-9]+$/;

const evmChecksumAddressSchema = z
	.string()
	.regex(evmChecksumAddressRegex, "Invalid EVM checksum address");
const evmTransactionHashSchema = z
	.string()
	.regex(evmTransactionHashRegex, "Invalid EVM transaction hash");
const eip712HexSchema = z
	.string()
	.regex(eip712HexRegex, "Invalid EIP-712 hex string");
const base58SolanaAddressSchema = z
	.string()
	.regex(base58SolanaAddress, "Invalid Base58 Solana address");
const base58SolanaTransactionHashSchema = z
	.string()
	.regex(base58SolanaTransactionHash, "Invalid Base58 Solana transaction hash");

const hashedNonceSchema = z
	.string()
	.regex(
		hashedNonceRegex,
		"Invalid nonce format, expected 32-byte hex string with 0x prefix"
	);

const numericNonceSchema = z
	.string()
	.regex(numericNonceRegex, "Invalid nonce format, expected numeric string");

const unixTimestampSchema = z
	.string()
	.regex(
		unixTimestampRegex,
		"Invalid timestamp format, expected unix timestamp"
	);

const schemeSchema = z
	.enum(["exact", "upto"])
	.describe(
		"Payment scheme, either 'exact' for fixed payments or 'upto' for variable payments up to a maximum amount"
	);

const acceptedSchema = z.object({
	scheme: schemeSchema,
	network: z.string().min(1),
	asset: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	amount: z.string().min(1),
	payTo: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	maxTimeoutSeconds: z.int().nonnegative(),
	extra: z.looseObject({}).optional(),
});

const resourceSchema = z
	.object({
		url: z.url(),
		description: z.string().max(500),
		mimeType: z.string(),
	})
	.optional();

const extensionsSchema = z.looseObject({}).optional();

const authorizationSchema = z.object({
	from: evmChecksumAddressSchema,
	to: evmChecksumAddressSchema,
	value: z.string().min(1),
	validAfter: unixTimestampSchema.refine(
		(value) => BigInt(value) <= BigInt(Math.floor(Date.now() / 1000)),
		"Payment not yet valid"
	),
	validBefore: unixTimestampSchema.refine(
		(value) => BigInt(value) >= BigInt(Math.floor(Date.now() / 1000)),
		"Payment has expired"
	),
	nonce: hashedNonceSchema,
});

const permit2AuthorizationSchema = z.object({
	from: evmChecksumAddressSchema,
	permitted: z.object({
		token: evmChecksumAddressSchema,
		amount: z.string().min(1),
	}),
	spender: evmChecksumAddressSchema,
	nonce: numericNonceSchema,
	deadline: z.string().min(1),
	witness: z.object({
		to: evmChecksumAddressSchema,
		validAfter: z.string().min(1),
		extra: z
			.string()
			.regex(/^0x[0-9a-fA-F]*$/)
			.optional(),
	}),
});

const x402VersionSchema = z.literal([1, 2]);

const payloadSchema = z.object({
	signature: eip712HexSchema,
});

const x402ExactEvmPayload = payloadSchema.extend({
	authorization: authorizationSchema,
});

const x402ExactEvmPermit2Payload = payloadSchema.extend({
	permit2Authorization: permit2AuthorizationSchema,
});

const paymentPayloadOption1Schema = z.object({
	x402Version: x402VersionSchema,
	payload: x402ExactEvmPayload.or(x402ExactEvmPermit2Payload),
	accepted: acceptedSchema,
	resource: resourceSchema,
	extensions: extensionsSchema,
});

const networkSchema = z.enum(supportedNetworks);

const paymentPayloadOption2Schema = z.object({
	x402Version: x402VersionSchema,
	scheme: z.enum(["exact"]),
	network: networkSchema,
	payload: x402ExactEvmPayload.or(x402ExactEvmPermit2Payload),
	accepted: acceptedSchema,
	resource: resourceSchema,
	extensions: extensionsSchema,
});

const paymentRequirementsOption1Schema = z.object({
	scheme: schemeSchema,
	network: z.string().min(1),
	asset: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	amount: z.string().min(1),
	payTo: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	maxTimeoutSeconds: z.int().nonnegative(),
	extra: z.looseObject({}).optional(),
});

const paymentRequirementsOption2Schema = z.object({
	scheme: z.enum(["exact"]),
	network: networkSchema,
	maxAmountRequired: z.string().min(1),
	resource: z.url(),
	description: z.string().max(500),
	mimeType: z.string().min(1),
	payTo: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	maxTimeoutSeconds: z.int().nonnegative(),
	asset: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	outputSchema: z.looseObject({}).optional(),
	extra: z.looseObject({}).optional(),
});

const verifyOption1Schema = z.object({
	x402Version: x402VersionSchema,
	paymentPayload: paymentPayloadOption1Schema,
	paymentRequirements: paymentRequirementsOption1Schema,
});

const verifyOption2Schema = z.object({
	x402Version: x402VersionSchema,
	paymentPayload: paymentPayloadOption2Schema,
	paymentRequirements: paymentRequirementsOption2Schema,
});

export const x402VerifyRequestBodySchema =
	verifyOption1Schema.or(verifyOption2Schema);

export type X402VerifyRequestBody =
	typeof x402VerifyRequestBodySchema._zod.input;

const x402VerifyInvalidReasons = [
	"insufficient_funds",
	"invalid_scheme",
	"invalid_network",
	"invalid_x402_version",
	"invalid_payment_requirements",
	"invalid_payload",
	"invalid_exact_evm_payload_authorization_value",
	"invalid_exact_evm_payload_authorization_value_too_low",
	"invalid_exact_evm_payload_authorization_valid_after",
	"invalid_exact_evm_payload_authorization_valid_before",
	"invalid_exact_evm_payload_authorization_typed_data_message",
	"invalid_exact_evm_payload_authorization_from_address_kyt",
	"invalid_exact_evm_payload_authorization_to_address_kyt",
	"invalid_exact_evm_payload_signature",
	"invalid_exact_evm_payload_signature_address",
	"invalid_exact_evm_permit2_payload_allowance_required",
	"invalid_exact_evm_permit2_payload_signature",
	"invalid_exact_evm_permit2_payload_deadline",
	"invalid_exact_evm_permit2_payload_valid_after",
	"invalid_exact_evm_permit2_payload_spender",
	"invalid_exact_evm_permit2_payload_recipient",
	"invalid_exact_evm_permit2_payload_amount",
	"invalid_exact_svm_payload_transaction",
	"invalid_exact_svm_payload_transaction_amount_mismatch",
	"invalid_exact_svm_payload_transaction_create_ata_instruction",
	"invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee",
	"invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset",
	"invalid_exact_svm_payload_transaction_instructions",
	"invalid_exact_svm_payload_transaction_instructions_length",
	"invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction",
	"invalid_exact_svm_payload_transaction_instructions_compute_price_instruction",
	"invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high",
	"invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked",
	"invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked",
	"invalid_exact_svm_payload_transaction_not_a_transfer_instruction",
	"invalid_exact_svm_payload_transaction_cannot_derive_receiver_ata",
	"invalid_exact_svm_payload_transaction_receiver_ata_not_found",
	"invalid_exact_svm_payload_transaction_sender_ata_not_found",
	"invalid_exact_svm_payload_transaction_simulation_failed",
	"invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata",
	"invalid_exact_svm_payload_transaction_fee_payer_included_in_instruction_accounts",
	"invalid_exact_svm_payload_transaction_fee_payer_transferring_funds",
	"unknown_error",
];

export const x402VerifyResponseSchema = z.object({
	isValid: z.boolean(),
	payer: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	invalidReason: z.enum(x402VerifyInvalidReasons).optional(),
	invalidMessage: z.string().optional(),
});

export type X402VerifyResponse = typeof x402VerifyResponseSchema._zod.output;

// SETTLE

const settleOption1Schema = z.object({
	x402Version: x402VersionSchema,
	paymentPayload: paymentPayloadOption1Schema,
	paymentRequirements: paymentRequirementsOption1Schema,
});

const settleOption2Schema = z.object({
	x402Version: x402VersionSchema,
	paymentPayload: paymentPayloadOption2Schema,
	paymentRequirements: paymentRequirementsOption2Schema,
});

export const x402SettleRequestBodySchema =
	settleOption1Schema.or(settleOption2Schema);

export type X402SettleRequestBody =
	typeof x402SettleRequestBodySchema._zod.input;

const x402SettleInvalidReasons = [
	"insufficient_funds",
	"invalid_scheme",
	"invalid_network",
	"invalid_x402_version",
	"invalid_payment_requirements",
	"invalid_payload",
	"invalid_exact_evm_payload_authorization_value",
	"invalid_exact_evm_payload_authorization_value_too_low",
	"invalid_exact_evm_payload_authorization_valid_after",
	"invalid_exact_evm_payload_authorization_valid_before",
	"invalid_exact_evm_payload_authorization_typed_data_message",
	"invalid_exact_evm_payload_authorization_from_address_kyt",
	"invalid_exact_evm_payload_authorization_to_address_kyt",
	"invalid_exact_evm_payload_signature",
	"invalid_exact_evm_payload_signature_address",
	"invalid_exact_evm_permit2_payload_allowance_required",
	"invalid_exact_evm_permit2_payload_signature",
	"invalid_exact_evm_permit2_payload_deadline",
	"invalid_exact_evm_permit2_payload_valid_after",
	"invalid_exact_evm_permit2_payload_spender",
	"invalid_exact_evm_permit2_payload_recipient",
	"invalid_exact_evm_permit2_payload_amount",
	"invalid_exact_svm_payload_transaction",
	"invalid_exact_svm_payload_transaction_amount_mismatch",
	"invalid_exact_svm_payload_transaction_create_ata_instruction",
	"invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee",
	"invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset",
	"invalid_exact_svm_payload_transaction_instructions",
	"invalid_exact_svm_payload_transaction_instructions_length",
	"invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction",
	"invalid_exact_svm_payload_transaction_instructions_compute_price_instruction",
	"invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high",
	"invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked",
	"invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked",
	"invalid_exact_svm_payload_transaction_not_a_transfer_instruction",
	"invalid_exact_svm_payload_transaction_cannot_derive_receiver_ata",
	"invalid_exact_svm_payload_transaction_receiver_ata_not_found",
	"invalid_exact_svm_payload_transaction_sender_ata_not_found",
	"invalid_exact_svm_payload_transaction_simulation_failed",
	"invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata",
	"invalid_exact_svm_payload_transaction_fee_payer_included_in_instruction_accounts",
	"invalid_exact_svm_payload_transaction_fee_payer_transferring_funds",
	"unknown_error",
];

export const x402SettleResponseSchema = z.object({
	success: z.boolean(),
	payer: evmChecksumAddressSchema.or(base58SolanaAddressSchema),
	transaction: evmTransactionHashSchema.or(base58SolanaTransactionHashSchema),
	network: z.string().min(1),
	errorReason: z.enum(x402SettleInvalidReasons).optional(),
	errorMessage: z.string().optional(),
	amount: z.string().optional(),
});

export type X402SettleResponse = typeof x402SettleResponseSchema._zod.output;
