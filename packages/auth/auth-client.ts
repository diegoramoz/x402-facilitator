import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";

export type { Passkey } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
	plugins: [passkeyClient()],
});
