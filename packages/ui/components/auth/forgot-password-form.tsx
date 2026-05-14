"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import { Button, buttonVariants } from "../button";
import { TextInputRaw } from "../form/text-input-raw";

export const { fieldContext, formContext, useFieldContext } =
	createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: { TextInputRaw },
	formComponents: {},
});

const forgotPasswordFormSchema = z.object({
	email: z.email().meta({ label: "Email Address" }),
});

type FormSchema = typeof forgotPasswordFormSchema._zod.input;

const defaultValues: FormSchema = {
	email: "",
};

export function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const form = useAppForm({
		defaultValues,
		validators: { onChange: forgotPasswordFormSchema },
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				await authClient.requestPasswordReset({
					email: value.email,
					redirectTo: "/reset-password",
				});

				toast.success(
					"If an account exists with that email, you will receive a password reset link"
				);
				setEmailSent(true);
			} catch {
				// Don't reveal if the email exists or not for security
				toast.success(
					"If an account exists with that email, you will receive a password reset link"
				);
				setEmailSent(true);
			} finally {
				setIsLoading(false);
			}
		},
	});

	if (emailSent) {
		return (
			<>
				<fieldset className="mb-8">
					<div className="mb-1 font-bold text-lg">Check your email</div>
					<div className="mb-4 text-muted-foreground">
						If an account exists with that email address, we will send
						instructions to reset your password
					</div>

					<div className="rounded-lg border bg-muted/50 p-4">
						<p className="text-sm">
							If you do not receive the email in a few minutes, check your spam
							folder.
						</p>
					</div>
				</fieldset>

				<div className="text-center">
					<p className="text-muted-foreground">You can close this tab.</p>
				</div>
			</>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<fieldset className="mb-8">
				<div className="mb-1 font-bold text-lg">Enter your email</div>
				<div className="mb-4 text-muted-foreground italic">
					We will send you a link to reset your password
				</div>

				<form.AppField name="email">
					{(field) => {
						const schema = forgotPasswordFormSchema.shape.email;
						return <field.TextInputRaw {...{ useFieldContext, schema }} />;
					}}
				</form.AppField>
			</fieldset>

			<form.Subscribe selector={(state) => [state.canSubmit]}>
				{([canSubmit]) => (
					<Button
						className="mb-4 w-full"
						disabled={canSubmit === false || isLoading}
						size="lg"
						type="submit"
					>
						<Send className="h-4 w-4" />
						{isLoading ? "Sending..." : "Send link"}
					</Button>
				)}
			</form.Subscribe>

			<Link
				className={`mb-6 w-full ${buttonVariants({ variant: "ghost", size: "lg" })}`}
				href="/login"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to sign in
			</Link>

			<div className="text-center text-muted-foreground text-sm">
				Don't have an account?{" "}
				<Link
					className="text-primary underline-offset-4 hover:underline"
					href="/signup"
				>
					Create account
				</Link>
			</div>
		</form>
	);
}
