"use client";

import type { ZodType } from "zod/v4";
import { Input } from "../input";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function CvvInput({ schema }: { schema?: ZodType<unknown, unknown> }) {
	const field = useFieldContext<string>();

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				autoComplete="cc-csc"
				id={field.name}
				inputMode="numeric"
				maxLength={4}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => {
					field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 4));
				}}
				placeholder="123"
				schema={schema}
				spellCheck="false"
				type="password"
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
