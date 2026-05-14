import type { ZodType } from "zod/v4";
import {
	type PhoneCountryCode,
	phoneCountryCodes,
	phoneCountryCodesMapping,
} from "../../../../shared/enums/phone";
import { Label } from "../../label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../select";
import { useFieldContext } from "..";
import { FieldInfo } from "../field-info";

export function CountryCodeInput({
	schema,
}: {
	schema?: ZodType<unknown, unknown>;
}) {
	const field = useFieldContext<string>();
	return (
		<>
			<Label htmlFor={field.name} schema={schema} />
			<Select
				onOpenChange={(open) => {
					if (open === false) {
						field.handleBlur();
					}
				}}
				onValueChange={(e) => field.handleChange(e as PhoneCountryCode)}
				value={field.state.value}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select" />
				</SelectTrigger>
				<SelectContent>
					{phoneCountryCodes.map((code) => (
						<SelectItem key={code} value={code}>
							{code} {phoneCountryCodesMapping[code]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldInfo field={field} />
		</>
	);
}
