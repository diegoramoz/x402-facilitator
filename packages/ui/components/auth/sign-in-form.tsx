"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FingerprintIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import { Button } from "../button";
import { TextInputRaw } from "../form/text-input-raw";
import { handleLoginWithPasskey } from "./login-with-passkey";

const HOMEPAGE = "/";

export const { fieldContext, formContext, useFieldContext } =
	createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: { TextInputRaw },
	formComponents: {},
});

const emailFormSchema = z.object({
	email: z.email().meta({ label: "Email Address" }),
	password: z.string().min(8).meta({ label: "Password" }),
});

type FormSchema = typeof emailFormSchema._zod.input;

const defaultValues: FormSchema = {
	email: "",
	password: "",
};

export function SignInForm() {
	const [showPasswordLogin, setShowPasswordLogin] = useState(false);
	const router = useRouter();

	const form = useAppForm({
		defaultValues,
		validators: { onChange: emailFormSchema },
		onSubmit: async ({ value }) => {
			try {
				const { data } = await authClient.signIn.email(
					{
						email: value.email,
						password: value.password,
						callbackURL: HOMEPAGE,
					},
					{
						onError: (ctx) => {
							if (ctx.error.status === 403) {
								toast.error("Please verify your email address");
							} else {
								toast.error(ctx.error.message || "Failed to sign in");
							}
						},
					}
				);

				if (data) {
					toast.success("Signed in successfully");
					router.push(HOMEPAGE);
				}
			} catch {
				toast.error("Failed to sign in");
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
			{/* Show passkey login prominently if user has a passkey */}
			{showPasswordLogin ? (
				<>
					<fieldset className="mb-8">
						<div className="mb-1 font-bold text-lg">Credentials</div>
						<div className="mb-4 text-muted-foreground italic">
							Enter your email and password
						</div>

						<form.AppField name="email">
							{(field) => {
								const schema = emailFormSchema.shape.email;
								return <field.TextInputRaw {...{ useFieldContext, schema }} />;
							}}
						</form.AppField>
						<form.AppField name="password">
							{(field) => {
								const schema = emailFormSchema.shape.password;
								return (
									<field.TextInputRaw
										{...{ useFieldContext, schema }}
										type="password"
									/>
								);
							}}
						</form.AppField>

						<div className="mt-2 text-right">
							<Link
								className="text-muted-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
								href="/forgot-password"
							>
								Forgot your password?
							</Link>
						</div>
					</fieldset>

					<form.Subscribe selector={(state) => [state.canSubmit]}>
						{([canSubmit]) => (
							<Button
								className="mb-4 w-full"
								disabled={canSubmit === false}
								size="lg"
								type="submit"
							>
								Sign in
							</Button>
						)}
					</form.Subscribe>

					<Button
						className="mb-6 w-full"
						onClick={async () => await handleLoginWithPasskey({ router })}
						size="lg"
						type="button"
						variant="secondary"
					>
						<FingerprintIcon className="h-4 w-4" />
						Sign in with passkey
					</Button>

					<div className="text-center text-muted-foreground text-sm">
						Don't have an account?{" "}
						<Link
							className="text-primary underline-offset-4 hover:underline"
							href="/signup"
						>
							Create an account
						</Link>
					</div>
				</>
			) : (
				<>
					<fieldset className="mb-8">
						<div className="mb-1 font-bold text-lg">Quick sign in</div>
						<div className="mb-4 text-muted-foreground italic">
							Use your passkey for a secure sign in
						</div>
					</fieldset>

					<Button
						className="mb-4 w-full"
						onClick={async () => await handleLoginWithPasskey({ router })}
						size="lg"
						type="button"
					>
						<FingerprintIcon className="h-4 w-4" />
						Sign in
					</Button>
					<Button
						className="mb-6 w-full"
						onClick={() => setShowPasswordLogin(true)}
						size="lg"
						type="button"
						variant="secondary"
					>
						<MailIcon className="h-4 w-4" />
						Other options
					</Button>

					<div className="text-center text-muted-foreground text-sm">
						Don't have an account?{" "}
						<Link
							className="text-primary underline-offset-4 hover:underline"
							href="/signup"
						>
							Create an account
						</Link>
					</div>
				</>
			)}
		</form>
	);
}
