import z from "zod/v4";

const evmChecksumAddressRegex = /^0x[0-9a-fA-F]{40}$/;
const eip712HexRegex = /^0x[0-9a-fA-F]{130,}$/;
const base58SolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const hashedNonceRegex = /^0x[0-9a-fA-F]{64}$/;
const numericNonceRegex = /^[0-9]+$/;

const evmChecksumAddressSchema = z
	.string()
	.regex(evmChecksumAddressRegex, "Invalid EVM checksum address");
const eip712HexSchema = z
	.string()
	.regex(eip712HexRegex, "Invalid EIP-712 hex string");
const base58SolanaAddressSchema = z
	.string()
	.regex(base58SolanaAddress, "Invalid Base58 Solana address");

const hashedNonceSchema = z
	.string()
	.regex(
		hashedNonceRegex,
		"Invalid nonce format, expected 32-byte hex string with 0x prefix"
	);

const numericNonceSchema = z
	.string()
	.regex(numericNonceRegex, "Invalid nonce format, expected numeric string");

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
	validAfter: z.string().min(1),
	validBefore: z.string().min(1),
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

const networkSchema = z.enum([
	"base-sepolia",
	"base",
	"solana-devnet",
	"solana",
	"arc-testnet",
	"arc",
]);

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

export const x402VerifySchema = verifyOption1Schema.or(verifyOption2Schema);
