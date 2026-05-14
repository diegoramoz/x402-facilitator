import { formInputMetaSchema } from "@ramoz/shared/zod";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { ZodType } from "zod/v4";

function Message({ children }: { children: React.ReactNode }) {
	return <div className="mb-2 font-medium text-sm italic">{children}</div>;
}

export function FieldInfo({
	field,
	info,
	schema,
}: {
	field: AnyFieldApi;
	info?: string;
	schema?: ZodType<unknown, unknown>;
}) {
	if (
		field.state.meta.isTouched === true &&
		field.state.meta.isValid === false
	) {
		const uniqueMessages = Array.from(
			new Set(
				field.state.meta.errors.map((err) => {
					const message = err.message;

					if (typeof message === "string") {
						return message;
					}

					return "error";
				})
			)
		);

		return <Message>{uniqueMessages.join(", ")}</Message>;
	}

	let infoChildren = info;

	if (typeof schema !== "undefined") {
		const schemaInfo = formInputMetaSchema.safeParse(schema.meta());
		if (schemaInfo.data?.info !== undefined) {
			infoChildren = schemaInfo.data.info;
		}
	}

	if (
		field.state.meta.isPristine === true &&
		typeof infoChildren === "string"
	) {
		return <Message>{infoChildren}</Message>;
	}

	// If the field is valid or not touched, we return an invisible element
	// to avoid layout shifts. Use a zero-width space to give it height.
	return <Message>&#8203;</Message>;
}
