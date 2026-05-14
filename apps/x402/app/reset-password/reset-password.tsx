"use client";

import { ResetPasswordForm } from "@ramoz/ui/components/auth/reset-password-form";
import { useSearchParams } from "next/navigation";
import { z } from "zod/v4";

export function ResetPassword() {
	const searchParams = useSearchParams();

	const tokenSchema = z.string().min(1);
	const errorSchema = z.enum(["INVALID_TOKEN"]);

	const tokenResult = tokenSchema.safeParse(searchParams.get("token"));
	const errorResult = errorSchema.safeParse(searchParams.get("error"));

	const token = tokenResult.success ? tokenResult.data : null;

	let error: string | null = null;
	if (errorResult.success && errorResult.data === "INVALID_TOKEN") {
		error = "The link has expired or is invalid";
	} else if (!tokenResult.success) {
		error = "No valid token was provided";
	}

	return (
		<div className="mx-auto max-w-sm pt-8">
			<div>Reset Password</div>
			<ResetPasswordForm error={error} token={token} />
		</div>
	);
}
