import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CardNumberInput } from "./card-number-input";
import { ChoiceInput } from "./choice-input";
import { ComboboxInput } from "./combobox-input";
import { CvvInput } from "./cvv-input";
import { DateInput } from "./date-input";
import { DateRangeInput } from "./date-range-input";
import { FieldInfo } from "./field-info";
import { NumberInput } from "./number-input";
import { CountryCodeInput } from "./phone/country-code";
import { PhoneNumberInput } from "./phone/phone-number";
import { SelectInput } from "./select-input";
import { SubscribeButton } from "./subscribe-button";
import { TextInput } from "./text-input";
import { TextInputRaw } from "./text-input-raw";
import { TextAreaInput } from "./textarea-input";
import { UsernameInput } from "./username-input";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		CardNumberInput,
		ChoiceInput,
		ComboboxInput,
		CountryCodeInput,
		CvvInput,
		DateInput,
		DateRangeInput,
		FieldInfo,
		NumberInput,
		PhoneNumberInput,
		SelectInput,
		TextAreaInput,
		TextInput,
		TextInputRaw,
		UsernameInput,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});

export function Form({
	children,
	onSubmit,
}: {
	children: React.ReactNode;
	onSubmit?: React.ChangeEventHandler<HTMLFormElement> | undefined;
}) {
	return (
		<form className="mx-auto mb-12" onSubmit={onSubmit}>
			{children}
		</form>
	);
}

export function FormWrapper({ children }: { children: React.ReactNode }) {
	return <div className="mx-auto mb-12 max-w-prose">{children}</div>;
}

export function Fieldset({ children }: { children: React.ReactNode }) {
	return <fieldset className="mb-6">{children}</fieldset>;
}

export function FieldsetHeader({ children }: { children: React.ReactNode }) {
	return <div className="mb-1 font-bold text-lg">{children}</div>;
}
export function FieldsetSubHeader({ children }: { children: React.ReactNode }) {
	return <div className="mb-4 text-muted-foreground italic">{children}</div>;
}
