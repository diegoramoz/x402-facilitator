import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod/v4";

export const env = createEnv({
	server: {
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
		PORT: z.coerce.number().optional(),
		PRIVATE_KEY: z.string(),
		CIRCLE_KIT_KEY: z.string(),
		CIRCLE_API_KEY: z.string(),
		CIRCLE_ENTITY_SECRET: z.string(),
		CIRCLE_WALLET_SET_ID: z.string(),
	},
	client: {},
	runtimeEnv: {
		VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
		PORT: process.env.PORT,
		PRIVATE_KEY: process.env.PRIVATE_KEY,
		CIRCLE_KIT_KEY: process.env.CIRCLE_KIT_KEY,
		CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
		CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
		CIRCLE_WALLET_SET_ID: process.env.CIRCLE_WALLET_SET_ID,
	},
	emptyStringAsUndefined: true,
});
