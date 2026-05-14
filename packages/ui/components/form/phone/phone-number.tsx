import { formatPhoneNumber } from "@ramoz/shared/number";
import { deleteNonDigits } from "@ramoz/shared/utils";
import type { ZodType } from "zod/v4";
import { Input } from "../../input";
import { Label } from "../../label";
import { useFieldContext } from "..";
import { FieldInfo } from "../field-info";

export function PhoneNumberInput({
	schema,
}: {
	schema?: ZodType<unknown, unknown>;
}) {
	const field = useFieldContext<string>();
	return (
		<>
			<Label htmlFor={field.name} schema={schema} />
			<Input
				autoComplete="off"
				autoCorrect="off"
				className="w-40"
				id={field.name}
				inputMode="numeric"
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => {
					const value = deleteNonDigits(e.target.value).slice(0, 10);

					field.handleChange(formatPhoneNumber(value));
				}}
				schema={schema}
				spellCheck="false"
				type="text"
				value={field.state.value}
			/>
			<FieldInfo field={field} />
		</>
	);
}
