export type AuthMode = "none" | "apiKey" | "session";

export type EndpointPolicy = {
	authMode: AuthMode;
	methods: readonly string[];
	cacheControl?: string;
	vary?: string;
};

export const API_POLICY = {
	v2: {
		supported: {
			authMode: "none",
			methods: ["GET", "OPTIONS"],
			cacheControl:
				"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
			vary: "Accept, Accept-Encoding",
		} satisfies EndpointPolicy,
		rpc: {
			authMode: "apiKey",
			methods: ["GET", "POST", "OPTIONS"],
		} satisfies EndpointPolicy,
		openapi: {
			authMode: "apiKey",
			methods: ["GET", "OPTIONS"],
		} satisfies EndpointPolicy,
	},
	admin: {
		rpc: {
			authMode: "session",
			methods: ["GET", "POST", "OPTIONS"],
		} satisfies EndpointPolicy,
	},
} as const;
