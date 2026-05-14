import { useFormContext } from ".";

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<button disabled={isSubmitting} type="button">
					{label}
				</button>
			)}
		</form.Subscribe>
	);
}
