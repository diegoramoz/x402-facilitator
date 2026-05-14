import { formInputMetaSchema } from "@ramoz/shared/zod";
import type { ZodType } from "zod/v4";
import { Label } from "../label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../select";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function SelectInput({
	schema,
	items,
	placeholder,
}: {
	schema?: ZodType<unknown, unknown>;
	items: [string, string][];
	placeholder?: string;
}) {
	const field = useFieldContext<string>();

	let resolvedPlaceholder = placeholder;
	if (
		typeof resolvedPlaceholder === "undefined" &&
		typeof schema !== "undefined"
	) {
		resolvedPlaceholder = formInputMetaSchema.parse(schema.meta()).placeholder;
	}

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />

			<Select
				name={field.name}
				onOpenChange={(open) => {
					if (open === false) {
						field.handleBlur();
					}
				}}
				onValueChange={(e) => e && field.handleChange(e)}
				value={field.state.value}
			>
				<SelectTrigger>
					<SelectValue placeholder={resolvedPlaceholder ?? "Select"} />
				</SelectTrigger>
				<SelectContent>
					{items.map(([id, displayName]) => (
						<SelectItem key={id} value={id}>
							{displayName}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldInfo field={field} />
		</div>
	);
}
