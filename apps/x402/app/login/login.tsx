"use client";

import { SignInForm } from "@ramoz/ui/components/auth/sign-in-form";

export function Login() {
	return (
		<div className="mx-auto max-w-sm pt-8">
			<div>Log In</div>
			<SignInForm />
		</div>
	);
}
