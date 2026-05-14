import { customAlphabet } from "nanoid";
import z from "zod/v4";

export const NANO_ID_LENGTH = 11;
const NANO_ID_ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const NANO_ID_REGEX = new RegExp(
	`^[${NANO_ID_ALPHABET}]{${NANO_ID_LENGTH}}$`
);
export const nanoIdSchema = z.string().regex(NANO_ID_REGEX, {
	message: `Nano ID must be exactly ${NANO_ID_LENGTH} characters long and can only contain the following characters: ${NANO_ID_ALPHABET}`,
});
export const myNanoid = customAlphabet(NANO_ID_ALPHABET, NANO_ID_LENGTH);
