import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { appRouter } from "@ramoz/api/routers/index";

declare global {
	var $orpc: RouterClient<typeof appRouter> | undefined;
}

const link = new RPCLink({
	url: () => {
		if (typeof window === "undefined") {
			throw new Error("RPCLink is not allowed on the server side.");
		}

		return `${window.location.origin}/rpc`;
	},
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const orpc: RouterClient<typeof appRouter> =
	globalThis.$orpc ?? createORPCClient(link);
