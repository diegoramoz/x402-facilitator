"use client";

import type { ZodType } from "zod/v4";
import { Input } from "../input";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

function formatCardNumber(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 16);
	return digits.replace(/(.{4})(?=.)/g, "$1 ");
}

export function CardNumberInput({
	schema,
}: {
	schema?: ZodType<unknown, unknown>;
}) {
	const field = useFieldContext<string>();

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				autoComplete="cc-number"
				id={field.name}
				inputMode="numeric"
				maxLength={19}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => {
					field.handleChange(formatCardNumber(e.target.value));
				}}
				placeholder="1234 5678 9012 3456"
				schema={schema}
				spellCheck="false"
				type="text"
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
