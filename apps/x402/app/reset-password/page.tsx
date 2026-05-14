import { auth } from "@ramoz/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { ResetPassword } from "@/app/reset-password/reset-password";

const HOMEPAGE = "/";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const params = await searchParams;
	const hasResetToken = z.string().safeParse(params.token).success;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Only redirect authenticated users if they don't have a reset token
	// If they have a token, they should be allowed to reset their password
	if (session && hasResetToken === false) {
		redirect(HOMEPAGE);
	}

	return <ResetPassword />;
}
