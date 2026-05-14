import { z } from "zod/v4";
import { EMPTY_STRING } from ".";

export function deleteNonDigits(value: string) {
	return value.replace(/\D/g, "");
}

export function deleteLineBreaks(value: string) {
	return value.replace(/\n/g, "");
}

export function emptyStringNotAllowed<T>(value: T, ctx: z.RefinementCtx) {
	if (value === EMPTY_STRING) {
		ctx.addIssue("Invalid value.");
		return z.NEVER;
	}
	return value;
}

export function emptyStringToUndefined(value: string) {
	return value === EMPTY_STRING ? undefined : value;
}

export const nullableDateSchema = z
	.union([z.literal(EMPTY_STRING), z.date()])
	.transform((value) => {
		if (value instanceof Date) {
			return value;
		}

		return;
	});

export const requiredDateSchema = z
	.union([z.literal(EMPTY_STRING), z.date()])
	.transform((value, ctx) => {
		if (value instanceof Date) {
			return value;
		}

		ctx.addIssue("Invalid value.");
		return z.NEVER;
	});
