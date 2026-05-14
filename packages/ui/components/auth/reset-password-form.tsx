"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod/v4";
import { cn } from "../../lib/utils";
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

const resetPasswordFormSchema = z
	.object({
		newPassword: z.string().min(8).meta({ label: "New Password" }),
		confirmPassword: z.string().min(8).meta({ label: "Confirm Password" }),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type FormSchema = typeof resetPasswordFormSchema._zod.input;

const defaultValues: FormSchema = {
	newPassword: "",
	confirmPassword: "",
};

export function ResetPasswordForm({
	token,
	error,
}: {
	token: string | null;
	error: string | null;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [passwordReset, setPasswordReset] = useState(false);
	const router = useRouter();

	const form = useAppForm({
		defaultValues,
		validators: { onChange: resetPasswordFormSchema },
		onSubmit: async ({ value }) => {
			if (!token) {
				toast.error("Invalid or expired token");
				return;
			}

			setIsLoading(true);
			try {
				const { error: resetError } = await authClient.resetPassword({
					newPassword: value.newPassword,
					token,
				});

				if (resetError) {
					toast.error(resetError.message || "Failed to reset password");
					return;
				}

				toast.success("Password updated successfully");
				setPasswordReset(true);

				// Redirect to login after 2 seconds
				setTimeout(() => {
					router.push("/login");
				}, 2000);
			} catch {
				toast.error("Failed to reset password");
			} finally {
				setIsLoading(false);
			}
		},
	});

	if (passwordReset) {
		return (
			<>
				<fieldset className="mb-8">
					<div className="mb-1 font-bold text-lg">Password updated!</div>
					<div className="mb-4 text-muted-foreground italic">
						Your password has been reset successfully
					</div>

					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="flex items-center gap-2 text-green-600">
							<Check className="h-5 w-5" />
							<p className="text-sm">Redirecting to the sign in page...</p>
						</div>
					</div>
				</fieldset>

				<Link
					className={cn("mb-6 w-full", buttonVariants({ size: "lg" }))}
					href="/login"
				>
					Go to sign in
				</Link>
			</>
		);
	}

	if (error) {
		return (
			<>
				<fieldset className="mb-8">
					<div className="mb-1 font-bold text-lg">Error</div>
					<div className="mb-4 text-muted-foreground italic">
						We could not validate your request
					</div>

					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
						<p className="text-destructive text-sm">{error}</p>
					</div>
				</fieldset>

				<Link
					className={cn("mb-4 w-full", buttonVariants({ size: "lg" }))}
					href="/forgot-password"
				>
					Request a new link
				</Link>

				<Link
					className={cn(
						"mb-6 w-full",
						buttonVariants({ size: "lg", variant: "outline" })
					)}
					href="/login"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to sign in
				</Link>
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
				<div className="mb-1 font-bold text-lg">New password</div>
				<div className="mb-4 text-muted-foreground italic">
					Enter your new password (minimum 8 characters)
				</div>

				<form.AppField name="newPassword">
					{(field) => {
						const schema = resetPasswordFormSchema.shape.newPassword;
						return (
							<field.TextInputRaw
								{...{ useFieldContext, schema }}
								type="password"
							/>
						);
					}}
				</form.AppField>
				<form.AppField name="confirmPassword">
					{(field) => {
						const schema = resetPasswordFormSchema.shape.confirmPassword;
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
						className="mb-4 w-full"
						disabled={canSubmit === false || isLoading}
						size="lg"
						type="submit"
					>
						<Check className="h-4 w-4" />
						{isLoading ? "Updating..." : "Update password"}
					</Button>
				)}
			</form.Subscribe>

			<Link
				className={cn(
					"mb-6 w-full",
					buttonVariants({ size: "lg", variant: "ghost" })
				)}
				href="/login"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to sign in
			</Link>
		</form>
	);
}
