import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { z } from "zod";

config({ path: "../../apps/finance/.env" });

const env = createEnv({
	server: { DATABASE_URL: z.string().min(1) },
	runtimeEnv: process.env,
});

export default defineConfig({
	schema: "./schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
