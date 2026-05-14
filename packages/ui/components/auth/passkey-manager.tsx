"use client";

import { authClient, type Passkey } from "@ramoz/auth/auth-client";
import { useAppState } from "@ramoz/ui/provider/finance/app-state-provider";
import { FingerprintIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../button";

export function PasskeyManager({ passkeys }: { passkeys: Passkey[] }) {
	const [loading, setLoading] = useState(false);
	const { app } = useAppState();
	const router = useRouter();

	async function handleCreatePasskey() {
		try {
			setLoading(true);
			toast("Creating passkey...");
			await authClient.passkey.addPasskey({
				name: `${app.user.email} ${new Date().toLocaleDateString()}`,
			});
			toast("Passkey created successfully");
			router.refresh();
		} catch {
			toast.error("Failed to create passkey");
		} finally {
			setLoading(false);
		}
	}

	async function handleDeletePasskey(passkeyId: string) {
		try {
			setLoading(true);
			toast("Deleting passkey...");
			await authClient.passkey.deletePasskey({
				id: passkeyId,
			});
			toast("Passkey deleted successfully");
			router.refresh();
		} catch {
			toast.error("Failed to delete passkey");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-4">
			{passkeys.length > 0 && (
				<div className="space-y-2">
					<p className="font-medium text-sm">
						Registered passkeys ({passkeys.length})
					</p>
					<div className="space-y-2">
						{passkeys.map((passkey) => (
							<div
								className="flex items-center justify-between rounded-md border p-3"
								key={passkey.id}
							>
								<div className="flex items-center gap-3">
									<FingerprintIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium text-sm">
											{passkey.name || "Unnamed passkey"}
										</p>
										<p className="text-muted-foreground text-xs">
											Created on{" "}
											{new Date(passkey.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button
									disabled={loading}
									onClick={() => handleDeletePasskey(passkey.id)}
									size="sm"
									type="button"
									variant="ghost"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			<Button disabled={loading} onClick={handleCreatePasskey} type="button">
				<FingerprintIcon className="mr-2 h-4 w-4" />
				{passkeys.length > 0 ? "Create New Passkey" : "Create Passkey"}
			</Button>
		</div>
	);
}
