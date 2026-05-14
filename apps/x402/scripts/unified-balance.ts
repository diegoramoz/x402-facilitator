import { inspect } from "node:util";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { AppKit } from "@circle-fin/app-kit";
import { env } from "@ramoz/env/finance";

const kit = new AppKit();

async function bridgeTokens() {
	const adapter = createViemAdapterFromPrivateKey({
		privateKey: env.PRIVATE_KEY,
	});

	// Deposit 1.00 USDC into the Unified Balance from Base
	const depositBase = await kit.unifiedBalance.deposit({
		from: { adapter, chain: "Base_Sepolia" },
		amount: "0.50",
		token: "USDC",
	});
	// Deposit 1.00 USDC into the Unified Balance from Arbitrum
	const depositArc = await kit.unifiedBalance.deposit({
		from: { adapter, chain: "Arc_Testnet" },
		amount: "1.00",
		token: "USDC",
	});

	// Spend 1.50 USDC from the Unified Balance on Arc
	const spendResult = await kit.unifiedBalance.spend({
		from: { adapter },
		amount: "1.50",
		to: {
			adapter,
			chain: "Arc_Testnet",
			recipientAddress: "0xRecipientAddress",
		},
	});

	console.log(
		inspect({ depositArc, depositBase, spendResult }, false, null, true)
	);
}

bridgeTokens();
