"use client";

import { authClient } from "@ramoz/auth/auth-client";
import type { useRouter } from "next/navigation";

const HOMEPAGE = "/";

export async function handleLoginWithPasskey({
	router,
}: {
	router: ReturnType<typeof useRouter>;
}) {
	try {
		await authClient.signIn.passkey({
			autoFill: false,
			fetchOptions: {
				onSuccess() {
					router.push(HOMEPAGE);
				},
				onError(context) {
					// Handle authentication errors
					console.error("Authentication failed:", context.error.message);
				},
			},
		});
	} catch (error) {
		console.error("Error logging in with passkey:", error);
	}
}
