import { formInputMetaSchema } from "@ramoz/shared/zod";
import type * as React from "react";
import type { ZodType } from "zod/v4";
import { cn } from "../lib/utils";

function Textarea({
	className,
	schema,
	...props
}: React.ComponentProps<"textarea"> & {
	schema?: ZodType<unknown, unknown>;
}) {
	let placeholder = props.placeholder;

	if (typeof placeholder === "undefined" && typeof schema !== "undefined") {
		placeholder = formInputMetaSchema.parse(schema.meta()).placeholder;
	}

	return (
		<textarea
			className={cn(
				"field-sizing-content flex min-h-16 w-full resize-none rounded-xl border border-input bg-input/30 px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
				className
			)}
			data-slot="textarea"
			// field-sizing-content is used to make the textarea height fit its content
			placeholder={placeholder}
			{...props}
		/>
	);
}

export { Textarea };
