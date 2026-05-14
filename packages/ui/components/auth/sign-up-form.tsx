"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import { Button } from "../button";
import { TextInputRaw } from "../form/text-input-raw";

const HOMEPAGE = "/";

export const { fieldContext, formContext, useFieldContext } =
	createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: { TextInputRaw },
	formComponents: {},
});

const signUpFormSchema = z.object({
	email: z.email().meta({ label: "Email Address" }),
	password: z.string().min(8).meta({ label: "Password" }),
});

type FormSchema = typeof signUpFormSchema._zod.input;

const defaultValues: FormSchema = {
	email: "",
	password: "",
};

export function SignUpForm() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useAppForm({
		defaultValues,
		validators: { onChange: signUpFormSchema },
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				const { data } = await authClient.signUp.email(
					{
						email: value.email,
						password: value.password,
						name: "",
						callbackURL: HOMEPAGE,
					},
					{
						onError: (ctx) => {
							if (ctx.error.status === 403) {
								toast.error("Please verify your email address");
							} else {
								toast.error(ctx.error.message || "Failed to create account");
							}
						},
					}
				);

				if (data) {
					toast.success(
						"Account created successfully. Please verify your email address."
					);
					// Redirect to email verification instructions page
					router.push("/verify-email");
				}
			} catch {
				toast.error("Failed to create account");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<fieldset className="mb-8">
				<div className="mb-1 font-bold text-lg">Account information</div>
				<div className="mb-4 text-muted-foreground italic">
					Create your account
				</div>

				<form.AppField name="email">
					{(field) => {
						const schema = signUpFormSchema.shape.email;
						return <field.TextInputRaw {...{ useFieldContext, schema }} />;
					}}
				</form.AppField>
				<form.AppField name="password">
					{(field) => {
						const schema = signUpFormSchema.shape.password;
						return (
							<field.TextInputRaw
								{...{ useFieldContext, schema }}
								type="password"
							/>
						);
					}}
				</form.AppField>
			</fieldset>

			<form.Subscribe selector={(state) => [state.canSubmit]}>
				{([canSubmit]) => (
					<Button
						className="mb-6 w-full"
						disabled={canSubmit === false || isLoading}
						size="lg"
						type="submit"
					>
						<UserPlusIcon />
						{isLoading ? "Creating account..." : "Create account"}
					</Button>
				)}
			</form.Subscribe>

			<div className="text-center text-muted-foreground text-sm">
				Already have an account?{" "}
				<Link
					className="text-primary underline-offset-4 hover:underline"
					href="/login"
				>
					Sign in
				</Link>
			</div>
		</form>
	);
}
