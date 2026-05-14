import { z } from "zod/v4";

// ─── Char schemas ─────────────────────────────────────────────────────────────
// Defined here (not in allowed-chars.ts) so that formInputMetaSchema can
// reference them without creating a circular dependency.
// allowed-chars.ts derives its CharFlag / CharPreset / CharSpec types from these.

export const charFlagSchema = z.enum([
	"letters",
	"numbers",
	"spaces",
	"punctuation",
	"newLines",
	"currencySymbols",
	"spanishLetters",
	"spanishPunctuation",
]);

export const charPresetSchema = z.enum([
	"name",
	"prose",
	"proseEs",
	"multiline",
	"username",
	"email",
]);

export const charSpecSchema = z.union([
	z.object({ preset: charPresetSchema }),
	z.object({ custom: z.array(charFlagSchema) }),
]);

// ─── Form input meta ──────────────────────────────────────────────────────────
// There's no point in creating a registry because the data could
// still be undefined

export const formInputMetaSchema = z
	.object({
		label: z.string(),
		info: z.string().optional(),
		placeholder: z.string().optional(),
		sectionHeading: z.string().optional(),
		chars: charSpecSchema.optional(),
	})
	.strict();
