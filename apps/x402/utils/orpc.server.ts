import "server-only";

import { createRouterClient } from "@orpc/server";
import { appRouter } from "@ramoz/api/routers/index";
import { auth } from "@ramoz/auth";
import { headers } from "next/headers";

export const orpc = createRouterClient(appRouter, {
	context: async () => {
		const headers_ = await headers();
		return {
			auth: null,
			session: await auth.api.getSession({ headers: headers_ }),
		};
	},
});

globalThis.$orpc = orpc;
