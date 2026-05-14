"use client";

import { authClient } from "@ramoz/auth/auth-client";
import { APP_STATE_STORAGE_KEY_PREFIX } from "@ramoz/ui/provider/finance/app-state-provider";
import { AlertTriangle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../button";

/**
 * Logout button component for settings page
 */
export function LogoutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();

		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(`${APP_STATE_STORAGE_KEY_PREFIX}:`)) {
				localStorage.removeItem(key);
			}
		}

		router.push("/login");
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-medium text-lg">Sign Out</h3>
				<p className="text-muted-foreground text-sm">
					Sign out of your current session on this device
				</p>
			</div>

			<div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/5 p-4">
				<AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
				<div className="flex-1">
					<p className="font-medium text-sm">Keep in mind</p>
					<p className="text-muted-foreground text-sm">
						You will need to sign in again to access your account.
					</p>
				</div>
			</div>

			<Button onClick={handleSignOut} type="button" variant="destructive">
				<LogOut className="mr-2 h-4 w-4" />
				Sign Out
			</Button>
		</div>
	);
}
