/**
 * create-wallet-set.ts
 *
 * WHY: Circle's developer-controlled wallets require a "wallet set" as a
 * logical container before any user wallets can be created. All user wallets
 * live under this single wallet set, so it must exist first.
 *
 * WHEN TO RUN: Once — during initial project setup or when provisioning a new
 * environment (e.g. staging, production). Never re-run it; creating a second
 * wallet set will orphan the first and break any wallets already created under
 * it.
 *
 * AFTER RUNNING: Copy the printed CIRCLE_WALLET_SET_ID value into your .env
 * file. The app reads this ID at runtime whenever it creates a wallet for a
 * new user.
 *
 * Usage: bun run scripts/create-wallet-set.ts
 */

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { env } from "@ramoz/env/finance";
import z from "zod/v4";

const circleClient = initiateDeveloperControlledWalletsClient({
	apiKey: env.CIRCLE_API_KEY,
	entitySecret: env.CIRCLE_ENTITY_SECRET,
});

// Main invocation
async function main() {
	console.log("\nCreating wallet set...");

	const walletSet_ = await circleClient.createWalletSet({
		name: "User Wallets",
	});

	const walletSet = z
		.object({
			data: z.object({ walletSet: z.object({ id: z.string() }) }),
		})
		.parse(walletSet_);

	const walletSetId = walletSet.data.walletSet.id;
	console.log("\nWallet set created successfully.");
	console.log("\nAdd this to your .env file:");
	console.log(`CIRCLE_WALLET_SET_ID=${walletSetId}\n`);
}

main().catch((error) => {
	console.error("\nError:", error.message ?? error);
	process.exit(1);
});
