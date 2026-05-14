import { formInputMetaSchema } from "@ramoz/shared/zod";
import type * as React from "react";
import type { ZodType } from "zod/v4";
import { cn } from "../lib/utils";

function Input({
	className,
	type,
	schema,
	...props
}: React.ComponentProps<"input"> & {
	schema?: ZodType<unknown, unknown>;
}) {
	let placeholder = props.placeholder;

	if (typeof placeholder === "undefined" && typeof schema !== "undefined") {
		placeholder = formInputMetaSchema.parse(schema.meta()).placeholder;
	}

	return (
		<input
			className={cn(
				"h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base outline-none transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				className
			)}
			data-slot="input"
			placeholder={placeholder}
			type={type}
			{...props}
		/>
	);
}

export { Input };
