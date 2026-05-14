import { inspect } from "node:util";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import type { BridgeParams } from "@circle-fin/app-kit";
import { AppKit } from "@circle-fin/app-kit";
import { env } from "@ramoz/env/finance";

const kit = new AppKit();

async function bridgeTokens() {
	const adapter = createViemAdapterFromPrivateKey({
		privateKey: env.PRIVATE_KEY,
	});

	const bridgeParams: BridgeParams = {
		from: { adapter, chain: "Arc_Testnet" },
		to: { adapter, chain: "Base_Sepolia" },
		amount: "1.00",
		token: "USDC",
	};

	const estimate = await kit.estimateBridge(bridgeParams);
	console.log("Estimated Fees:", estimate);
	const result = await kit.bridge(bridgeParams);
	console.log(inspect(result, false, null, true));
}

bridgeTokens();
