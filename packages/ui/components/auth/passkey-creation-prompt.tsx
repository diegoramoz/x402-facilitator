"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { useAppState } from "@ramoz/ui/provider/finance/app-state-provider";
import { FingerprintIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../card";

export function PasskeyCreationPrompt() {
	const [showPrompt, setShowPrompt] = useState(false);
	const [loading, setLoading] = useState(false);
	const { app, setApp } = useAppState();
	const router = useRouter();

	useEffect(() => {
		// Show prompt if user doesn't have passkey and hasn't dismissed it
		if (app.passkeyPromptDismissed === false) {
			setShowPrompt(true);
		}
	}, [app.passkeyPromptDismissed]);

	async function handleCreatePasskey() {
		try {
			setLoading(true);
			toast("Creating passkey...");

			// Get user email for passkey name
			await authClient.passkey.addPasskey({
				name: `${app.user.email} ${new Date().toLocaleDateString()}`,
			});

			toast("Passkey created successfully!");

			// Update passkey status
			setShowPrompt(false);
			router.refresh();
		} catch (error) {
			console.error("Error creating passkey:", error);
			toast("Failed to create passkey. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	function handleSkip() {
		setApp((previous) => ({ ...previous, passkeyPromptDismissed: true }));
		setShowPrompt(false);
	}

	if (!showPrompt) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="relative">
					<Button
						className="absolute top-2 right-2"
						disabled={loading}
						onClick={handleSkip}
						size="icon"
						variant="ghost"
					>
						<XIcon className="h-4 w-4" />
					</Button>
					<CardTitle className="flex items-center gap-2">
						<FingerprintIcon className="h-5 w-5" />
						Set up your passkey
					</CardTitle>
					<CardDescription>
						Sign in faster and more securely with a passkey
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p className="text-muted-foreground text-sm">
						Passkeys let you sign in using your fingerprint, face recognition,
						or your device PIN. It is safer than passwords and much faster.
					</p>
					<div className="flex flex-col gap-2">
						<Button
							className="w-full"
							disabled={loading}
							onClick={handleCreatePasskey}
						>
							<FingerprintIcon />
							Create passkey
						</Button>
						<Button
							className="w-full text-xs"
							disabled={loading}
							onClick={handleSkip}
							variant="ghost"
						>
							Skip for now
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
