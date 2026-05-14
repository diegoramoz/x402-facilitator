import Decimal from "decimal.js-light";

const MONEY_DECIMALS = 2;
const HUNDRED = 100;

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type MoneyInput = string | number | Decimal;

export function toMoneyDecimal(value: MoneyInput) {
	return new Decimal(value).toDecimalPlaces(
		MONEY_DECIMALS,
		Decimal.ROUND_HALF_UP
	);
}

export function toMoneyNumber(value: MoneyInput) {
	return toMoneyDecimal(value).toNumber();
}

export function toMoneyString(value: MoneyInput) {
	return toMoneyDecimal(value).toFixed(MONEY_DECIMALS);
}

export function toMoneyCents(value: MoneyInput) {
	return toMoneyDecimal(value)
		.times(HUNDRED)
		.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
		.toNumber();
}

export function sumMoney(values: MoneyInput[]) {
	return values.reduce<Decimal>(
		(acc, value) => acc.plus(toMoneyDecimal(value)),
		new Decimal(0)
	);
}

export function multiplyMoney(value: MoneyInput, multiplier: MoneyInput) {
	return toMoneyDecimal(value)
		.times(new Decimal(multiplier))
		.toDecimalPlaces(MONEY_DECIMALS, Decimal.ROUND_HALF_UP);
}

export function subtractMoney(value: MoneyInput, subtrahend: MoneyInput) {
	return toMoneyDecimal(value)
		.minus(toMoneyDecimal(subtrahend))
		.toDecimalPlaces(MONEY_DECIMALS, Decimal.ROUND_HALF_UP);
}

export function nonNegativeMoney(value: MoneyInput) {
	const rounded = toMoneyDecimal(value);

	if (rounded.lessThan(0)) {
		return new Decimal(0);
	}

	return rounded;
}

export function parseFormCurrencyToDb(value: string) {
	const digitsOnly = value.replace(/\D/g, "");

	if (digitsOnly.length === 0) {
		return toMoneyString(0);
	}

	return toMoneyString(new Decimal(digitsOnly).dividedBy(HUNDRED));
}
