"use client";

import { NumberField } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { ZodType } from "zod/v4";
import { cn } from "../../lib/utils";
import { Label } from "../label";
import { useFieldContext } from ".";
import { FieldInfo } from "./field-info";

export function NumberInput({
	format,
	max,
	min,
	schema,
	step,
}: {
	schema?: ZodType<unknown, unknown>;
	format?: Intl.NumberFormatOptions;
	min?: number;
	max?: number;
	step?: number | "any";
}) {
	const field = useFieldContext<number | null>();
	const hasError =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	return (
		<>
			<Label htmlFor={field.name} schema={schema} />
			<NumberField.Root
				format={format}
				id={field.name}
				max={max}
				min={min}
				name={field.name}
				onBlur={field.handleBlur}
				onValueChange={(value) => field.handleChange(value)}
				step={step}
				value={field.state.value}
			>
				<NumberField.Group
					className={cn(
						"flex h-9 w-full min-w-0 items-center rounded-4xl border border-input bg-input/30 transition-colors",
						"has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
						hasError &&
							"border-destructive ring-[3px] ring-destructive/20 dark:ring-destructive/40"
					)}
					data-slot="input-group"
				>
					<NumberField.Decrement
						className="flex size-9 shrink-0 cursor-default items-center justify-center rounded-l-4xl text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
						type="button"
					>
						<MinusIcon className="size-3.5" />
					</NumberField.Decrement>
					<NumberField.Input
						className="h-full w-full min-w-0 flex-1 border-0 bg-transparent text-center text-base outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm"
						spellCheck="false"
					/>
					<NumberField.Increment
						className="flex size-9 shrink-0 cursor-default items-center justify-center rounded-r-4xl text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
						type="button"
					>
						<PlusIcon className="size-3.5" />
					</NumberField.Increment>
				</NumberField.Group>
			</NumberField.Root>
			<FieldInfo field={field} />
		</>
	);
}
