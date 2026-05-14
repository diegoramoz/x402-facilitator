import { EMPTY_STRING } from ".";
import { parseFormCurrencyToDb, toMoneyNumber } from "./money";

export const usdIntl = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export const quantityIntl = new Intl.NumberFormat("en-US", {
	style: "decimal",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const integerIntl = new Intl.NumberFormat("en-US");

export function round(value: number) {
	return toMoneyNumber(value);
}

// The numbers are handled as strings without decimal points.
// For example, $123.45 is stored as "12345".
// This function converts the string to a number, divides by 100,
// and formats it to two decimal places.
export function formatFormCurrencyForDatabase(value: string) {
	return parseFormCurrencyToDb(value);
}

export function formatFormCurrencyForDatabaseNullable(value: string) {
	if (value === EMPTY_STRING) {
		return;
	}

	return parseFormCurrencyToDb(value);
}

export function formatFormDecimalForDatabase(value: string) {
	return parseFormCurrencyToDb(value);
}

export function formatPhoneNumber(phoneNumber: string) {
	// 809 123-4567
	const area = phoneNumber.slice(0, 3);

	const slice2 = phoneNumber.slice(3, 6);
	const slice3 = phoneNumber.slice(6);

	const phone1 = slice2.length > 0 ? ` ${slice2}` : "";
	const phone2 = slice3.length > 0 ? `-${slice3}` : "";

	return `${area}${phone1}${phone2}`;
}
