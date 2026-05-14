"use client";

import type { ZodType } from "zod/v4";
import { Label } from "../label";
import { Toggle } from "../toggle";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function ChoiceInput({
	schema,
	items,
	mode = "multiple",
}: {
	schema?: ZodType<unknown, unknown>;
	items: [string, string][];
	mode?: "single" | "multiple";
}) {
	const field = useFieldContext<string | string[]>();

	// Single item: behaves as a checkbox toggle
	if (items.length === 1) {
		const first = items[0];
		if (!first) {
			return null;
		}
		const [itemValue, displayName] = first;

		return (
			<div>
				<Label htmlFor={field.name} schema={schema} />
				<Toggle
					id={field.name}
					onBlur={field.handleBlur}
					onPressedChange={(pressed) =>
						field.handleChange(pressed ? itemValue : "")
					}
					pressed={field.state.value === itemValue}
					size="card"
					variant="card"
				>
					{displayName}
				</Toggle>
				<FieldInfo field={field} />
			</div>
		);
	}

	// Multiple items: use ToggleGroup
	const toArray = (v: string | string[]) => {
		if (Array.isArray(v)) {
			return v;
		}
		return v ? [v] : [];
	};
	const currentValues = field.state.meta.isTouched
		? toArray(field.state.value)
		: ([] as string[]);

	return (
		<div>
			<Label htmlFor={field.name} schema={schema} />
			<ToggleGroup
				className="w-full flex-col items-stretch gap-3"
				id={field.name}
				onBlur={field.handleBlur}
				onValueChange={(values) => {
					if (mode === "multiple") {
						field.handleChange(values);
					} else {
						field.handleChange(values[0] ?? "");
					}
				}}
				spacing={3}
				value={currentValues}
			>
				{items.map(([itemValue, displayName]) => (
					<ToggleGroupItem
						className="w-full justify-start"
						key={itemValue}
						size="card"
						value={itemValue}
						variant="card"
					>
						{displayName}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<FieldInfo field={field} />
		</div>
	);
}
