import { formInputMetaSchema } from "@ramoz/shared/zod";
import type { ZodType } from "zod/v4";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput as ComboboxInputPrimitive,
	ComboboxItem,
	ComboboxList,
} from "../combobox";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

// const normalizeSearchText = (value: string) =>
// 	value
// 		.normalize("NFD")
// 		.replace(/\p{Diacritic}/gu, "")
// 		.toLowerCase()
// 		.trim();

// const fuzzyIncludes = (target: string, query: string) => {
// 	const normalizedTarget = normalizeSearchText(target);
// 	const normalizedQuery = normalizeSearchText(query);

// 	if (!normalizedQuery) {
// 		return true;
// 	}

// 	let queryIndex = 0;

// 	for (const char of normalizedTarget) {
// 		if (char === normalizedQuery[queryIndex]) {
// 			queryIndex += 1;
// 		}

// 		if (queryIndex >= normalizedQuery.length) {
// 			return true;
// 		}
// 	}

// 	return false;
// };

export function ComboboxInput({
	schema,
	items,
	placeholder,
}: {
	schema?: ZodType<unknown, unknown>;
	items: { id: string; label: string; value: string }[];
	placeholder?: string;
}) {
	const field = useFieldContext<{
		id: string;
		label: string;
		value: string;
	}>();

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

			<Combobox
				// filter={(item, query) => {
				// 	return fuzzyIncludes(displayName, query);
				// }}
				items={items}
				onValueChange={(e) => e && field.handleChange(e)}
				value={field.state.value}
			>
				<ComboboxInputPrimitive
					id={field.name}
					placeholder={resolvedPlaceholder ?? "Search or select"}
					showClear
				/>
				<ComboboxContent>
					<ComboboxEmpty>No results found.</ComboboxEmpty>
					<ComboboxList>
						{(item: { id: string; label: string; value: string }) => (
							<ComboboxItem key={item.id} value={item}>
								{item.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			<FieldInfo field={field} />
		</div>
	);
}
