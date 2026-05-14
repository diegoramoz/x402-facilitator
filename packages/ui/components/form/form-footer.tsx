"use client";

import type { AnyFormApi } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { Button } from "../button";

export function FormFooter({
	form,
	label,
}: {
	form: AnyFormApi;
	label: string;
}) {
	const canSubmit = useStore(form.store, (s) => s.canSubmit);
	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
	const errorMap = useStore(form.store, (s) => s.errorMap);

	return (
		<div className="mt-6 space-y-3">
			<div className="min-h-5">
				{errorMap?.onSubmit ? (
					<p className="text-destructive text-sm">
						{String(errorMap.onSubmit)}
					</p>
				) : (
					<p className="invisible text-sm">&#8203;</p>
				)}
			</div>
			<Button disabled={!canSubmit || isSubmitting} type="submit">
				{isSubmitting ? "Saving..." : label}
			</Button>
		</div>
	);
}
