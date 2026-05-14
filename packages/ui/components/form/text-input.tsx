import {
	type CharSpec,
	getCleanTextUnicode,
} from "@ramoz/shared/allowed-chars";
import { formInputMetaSchema } from "@ramoz/shared/zod";
import { useFilteredInput } from "@ramoz/ui/hooks/use-filtered-input";
import { useRef } from "react";
import type { ZodType } from "zod/v4";
import { Input } from "../input";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function TextInput({ schema }: { schema?: ZodType<unknown, unknown> }) {
	const field = useFieldContext<string>();
	const inputRef = useRef<HTMLInputElement>(null);

	let chars: CharSpec | undefined;

	if (typeof schema !== "undefined") {
		chars = formInputMetaSchema.parse(schema.meta()).chars;
	}

	const handleChange = useFilteredInput({
		ref: inputRef,
		filter: (value) => getCleanTextUnicode({ value, chars }),
		onChange: field.handleChange,
	});

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={handleChange}
				ref={inputRef}
				schema={schema}
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
