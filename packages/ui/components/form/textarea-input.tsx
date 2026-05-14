import {
	type CharSpec,
	getCleanTextUnicode,
} from "@ramoz/shared/allowed-chars";
import { formInputMetaSchema } from "@ramoz/shared/zod";
import { useFilteredInput } from "@ramoz/ui/hooks/use-filtered-input";
import { useEffect, useRef, useState } from "react";
import type { ZodType } from "zod/v4";
import { Label } from "../label";
import { Textarea } from "../textarea";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

const MAX_ROWS = 15;

export function TextAreaInput({
	schema,
	rows = 5,
}: {
	rows?: number;
	schema?: ZodType<unknown, unknown>;
}) {
	const field = useFieldContext<string>();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [dynamicRows, setDynamicRows] = useState(rows);

	let chars: CharSpec | undefined;

	if (typeof schema !== "undefined") {
		chars = formInputMetaSchema.parse(schema.meta()).chars;
	}

	useEffect(() => {
		const value = field.state.value ?? "";
		const lineCount = value.split("\n").length;
		const calculatedRows = Math.min(Math.max(lineCount, rows), MAX_ROWS);
		setDynamicRows(calculatedRows);
	}, [field.state.value, rows]);

	const handleChange = useFilteredInput({
		ref: textareaRef,
		filter: (value) => getCleanTextUnicode({ value, chars }),
		onChange: field.handleChange,
	});

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<Textarea
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={handleChange}
				ref={textareaRef}
				rows={dynamicRows}
				schema={schema}
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</div>
	);
}
