import { Pool } from "@neondatabase/serverless";
import { env } from "@ramoz/env/server";
import { drizzle } from "drizzle-orm/neon-serverless";

function createDb() {
	const pool = new Pool({ connectionString: env.DATABASE_URL });
	return drizzle({ client: pool });
}

export const db = createDb();
