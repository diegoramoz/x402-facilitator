import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { env } from "@ramoz/env/finance";

// Replace the source and destination constants with your own wallet values
const SOURCE_WALLET_ADDRESS: string = "0x..."; // Used with blockchain to identify the source wallet
const SOURCE_WALLET_BLOCKCHAIN = "ARC-TESTNET"; // Used with blockchain to identify the source wallet
const DESTINATION_WALLET_ADDRESS: string = "0x..."; // Recipient wallet address
const DESTINATION_WALLET_ID: string = "..."; // Used for post-transfer balance check only
const ARC_TESTNET_USDC: string = "0x3600000000000000000000000000000000000000";
const TRANSFER_AMOUNT_USDC: string = "5"; // Token quantity as a string

// Initialize the wallets client
const client = initiateDeveloperControlledWalletsClient({
	apiKey: env.CIRCLE_API_KEY,
	entitySecret: env.CIRCLE_ENTITY_SECRET,
});

async function main() {
	// Validate the wallet inputs
	if (
		SOURCE_WALLET_ADDRESS === "YOUR_SOURCE_WALLET_ADDRESS" ||
		DESTINATION_WALLET_ID === "YOUR_DESTINATION_WALLET_ID" ||
		DESTINATION_WALLET_ADDRESS === "YOUR_DESTINATION_WALLET_ADDRESS"
	) {
		throw new Error(
			"Replace the wallet constants at the top of send-tokens.ts before running the script."
		);
	}

	// Create the transfer transaction
	const transferResponse = await client.createTransaction({
		blockchain: SOURCE_WALLET_BLOCKCHAIN,
		walletAddress: SOURCE_WALLET_ADDRESS,
		tokenAddress: ARC_TESTNET_USDC, // USDC contract address on Arc Testnet; replace for other chains
		destinationAddress: DESTINATION_WALLET_ADDRESS,
		amount: [TRANSFER_AMOUNT_USDC],
		fee: {
			type: "level",
			config: { feeLevel: "MEDIUM" }, // Gas fee strategy: LOW, MEDIUM, or HIGH
		},
	});

	const transactionId = transferResponse.data?.id;
	let currentState = transferResponse.data?.state ?? "";

	if (!transactionId) {
		throw new Error("Transaction creation failed: no ID returned");
	}

	console.log("Transfer response:", transferResponse.data);

	// Wait for the transfer to finish
	const terminalStates = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);

	while (!terminalStates.has(currentState)) {
		await new Promise((resolve) => setTimeout(resolve, 3000));
		const pollResponse = await client.getTransaction({ id: transactionId });
		const tx = pollResponse.data?.transaction;
		currentState = tx?.state ?? "";
		console.log("Transaction response:", pollResponse.data);

		if (currentState === "COMPLETE") {
			break;
		}
	}

	if (currentState !== "COMPLETE") {
		throw new Error(`Transaction ended in state: ${currentState}`);
	}

	// Check the recipient balance
	const destinationBalanceResponse = await client.getWalletTokenBalance({
		id: DESTINATION_WALLET_ID,
	});

	console.log("Wallet balance response:", destinationBalanceResponse.data);
}

main().catch((err) => {
	console.error("Error:", err.message || err);
	process.exit(1);
});
