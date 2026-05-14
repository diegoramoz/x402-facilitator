import { parseUsernameInput } from "@ramoz/shared/allowed-chars";
import type { ZodType } from "zod/v4";
import { Input } from "../input";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function UsernameInput({
	schema,
}: {
	schema?: ZodType<unknown, unknown>;
}) {
	const field = useFieldContext<string>();

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(parseUsernameInput(e.target.value))}
				schema={schema}
				value={field.state.value}
			/>
			<FieldInfo field={field} schema={schema} />
		</div>
	);
}
