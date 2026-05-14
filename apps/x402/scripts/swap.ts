import { inspect } from "node:util";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import type { SwapParams } from "@circle-fin/app-kit";
import { AppKit } from "@circle-fin/app-kit";
import { env } from "@ramoz/env/finance";

const kit = new AppKit();

async function swapTokens() {
	const adapter = createViemAdapterFromPrivateKey({
		privateKey: env.PRIVATE_KEY,
	});

	const swapParams: SwapParams = {
		from: { adapter, chain: "Arc_Testnet" },
		tokenIn: "USDC",
		tokenOut: "EURC",
		amountIn: "1.00",
		config: {
			kitKey: env.CIRCLE_KIT_KEY,
		},
	};

	const estimate = await kit.estimateSwap(swapParams);
	console.log("Estimated Fees:", estimate);
	const result = await kit.swap(swapParams);
	console.log(inspect(result, false, null, true));
}

swapTokens();
