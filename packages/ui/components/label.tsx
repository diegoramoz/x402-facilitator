"use client";

import { formInputMetaSchema } from "@ramoz/shared/zod";
import type * as React from "react";
import type { ZodType } from "zod/v4";
import { cn } from "../lib/utils";

function Label({
	className,
	schema,
	...props
}: React.ComponentProps<"label"> & {
	schema?: ZodType<unknown, unknown>;
}) {
	const required =
		typeof schema === "undefined"
			? false
			: schema.safeParse(undefined).success === false;

	let children = props.children;

	if (typeof children === "undefined" && typeof schema !== "undefined") {
		children = formInputMetaSchema.parse(schema.meta()).label;
	}

	return (
		<label
			aria-label={props["aria-label"]}
			className={cn(
				"mb-1.5 inline-flex select-none items-center gap-1 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				// "data-required:after:text-red-500 data-required:after:content-['*']",
				className
			)}
			data-required={required}
			data-slot="label"
			htmlFor={props.htmlFor}
			{...props}
		>
			{children}
		</label>
	);
}

export { Label };
