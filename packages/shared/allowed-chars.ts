import { z } from "zod/v4";
import { EMPTY_STRING } from ".";
import {
	formatFormCurrencyForDatabase,
	formatFormDecimalForDatabase,
} from "./number";
import { emptyStringNotAllowed, emptyStringToUndefined } from "./utils";
import type {
	charFlagSchema,
	charPresetSchema,
	charSpecSchema,
	formInputMetaSchema,
} from "./zod";

type FormInputMeta = z.infer<typeof formInputMetaSchema>;

// ─── Types derived from zod schemas ──────────────────────────────
// Single source of truth lives in zod.ts; types are derived here.

export type CharFlag = z.infer<typeof charFlagSchema>;
export type CharPreset = z.infer<typeof charPresetSchema>;
export type CharSpec = z.infer<typeof charSpecSchema>;

// ─── Named presets ────────────────────────────────────────────────────────────
// Semantic names that capture the intent of a field. Add a new entry here when
// a combination recurs across multiple tables.

const PRESET_FLAGS: Record<CharPreset, CharFlag[]> = {
	name: ["letters"],
	prose: ["letters", "numbers", "spaces", "punctuation"],
	proseEs: ["letters", "numbers", "spaces", "punctuation", "spanishLetters"],
	multiline: [
		"letters",
		"numbers",
		"spaces",
		"punctuation",
		"newLines",
		"spanishLetters",
		"spanishPunctuation",
	],
	username: ["letters", "numbers"],
	email: ["letters", "numbers", "punctuation"],
};

function resolveFlags(chars: CharSpec): CharFlag[] {
	return "preset" in chars ? PRESET_FLAGS[chars.preset] : chars.custom;
}

// ─── TextFieldMeta ────────────────────────────────────────────────────────────

export type TextFieldMeta = FormInputMeta & { chars: CharSpec };

// ─── Regex builder ────────────────────────────────────────────────

function cleanTextRegex(flags: CharFlag[]) {
	const has = (f: CharFlag) => flags.includes(f);
	const l = has("letters") ? "A-Za-z" : "";
	const n = has("numbers") ? "0-9" : "";
	const s = has("spaces") ? "\\s" : "";
	const p = has("punctuation")
		? `\`~!@#$%^&*()_+\\-={}|[\\]:"\u201c"\u2019\u2018\u2018\u2019<>?,./\\\\`
		: "";
	const sl = has("spanishLetters")
		? "\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1"
		: "";
	const sp = has("spanishPunctuation") ? "\u00a1\u00bf" : "";

	return new RegExp(`[^${l}${n}${s}${p}${sl}${sp}]`, "gu");
}

// ─── getCleanTextUnicode ──────────────────────────────────────────
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
// https://unicode.org/reports/tr18/#General_Category_Property
// Remove any strange characters like emojis, special characters, etc.

const spacesRegex = /\s+/;

export function getCleanTextUnicode({
	value,
	chars = { custom: [] },
	allowMultipleSpaces = false,
}: {
	value: string;
	chars?: CharSpec;
	allowMultipleSpaces?: boolean;
}) {
	const flags = resolveFlags(chars);
	const regex = cleanTextRegex(flags);

	if (flags.includes("newLines")) {
		const lines = value.split("\n");
		const cleanedLines = lines.map((line) => {
			const cleanedLine = line.replace(regex, "");
			return allowMultipleSpaces
				? cleanedLine
				: cleanedLine.split(spacesRegex).join(" ");
		});
		return cleanedLines.join("\n");
	}

	const payload = value.replace(regex, "");
	return allowMultipleSpaces ? payload : payload.split(spacesRegex).join(" ");
}

// ─── Field builders ───────────────────────────────────────────────

export function textField(meta: TextFieldMeta) {
	return z
		.string()
		.overwrite((value) => getCleanTextUnicode({ value, chars: meta.chars }))
		.meta(meta);
}

export function enumField<T extends string>(values: T[], meta: FormInputMeta) {
	return z
		.enum([EMPTY_STRING, ...values])
		.transform((value, ctx): T => emptyStringNotAllowed(value as T, ctx))
		.meta(meta);
}

export function optionalEnumField<T extends string>(
	values: T[],
	meta: FormInputMeta
) {
	return z
		.enum([EMPTY_STRING, ...values])
		.transform(
			(value): T | undefined => emptyStringToUndefined(value) as T | undefined
		)
		.meta(meta);
}

export function decimalField(meta: FormInputMeta) {
	return z.string().transform(formatFormDecimalForDatabase).meta(meta);
}

export function currencyField(meta: FormInputMeta) {
	return z.string().transform(formatFormCurrencyForDatabase).meta(meta);
}

const integerRegex = /^-?\d+$/;

export function integerField(meta: FormInputMeta) {
	return z
		.string()
		.regex(integerRegex, "Must be a whole number")
		.transform(Number)
		.meta(meta);
}

const usernameAllowedCharacters = /[^a-z0-9_]/g;

// english alphabet, lowercase, alphanumeric plus underscore characters
// allowed but with no consecutive underscores and no underscore
// allowed at the beginning or end of the string
// https://regexr.com/8g8lf
export const usernameRegex = /^[a-z0-9]+(_[a-z0-9]+)*$/g;

export function usernameField(meta: TextFieldMeta) {
	return z
		.string()
		.overwrite((value) => parseUsernameInput(value))
		.meta(meta);
}

export function parseUsernameInput(value: string) {
	return value
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(usernameAllowedCharacters, "")
		.replace(/_+/g, "_");
}
