import type { AnyFieldApi } from "@tanstack/react-form";
import type { ZodType } from "zod/v4";
import { Input } from "../input";
import { Label } from "../label";
import { FieldInfo } from "./field-info";

export function TextInputRaw({
	schema,
	useFieldContext,
	type = "text",
}: {
	schema?: ZodType<unknown, unknown>;
	useFieldContext: <_TData>() => AnyFieldApi;
	type?: string;
}) {
	const field = useFieldContext<string>();

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				schema={schema}
				type={type}
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
