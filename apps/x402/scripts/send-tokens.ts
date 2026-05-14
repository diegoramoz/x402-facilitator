import { inspect } from "node:util";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import type { SendParams } from "@circle-fin/app-kit";
import { AppKit } from "@circle-fin/app-kit";
import { env } from "@ramoz/env/finance";
import { TEST_RECIPIENT } from "@/lib/constants";

const kit = new AppKit();

async function sendTokens() {
	const adapter = createViemAdapterFromPrivateKey({
		privateKey: env.PRIVATE_KEY,
	});

	const sendParams: SendParams = {
		from: { adapter, chain: "Arc_Testnet" },
		to: TEST_RECIPIENT,
		amount: "1.00",
		token: "USDC",
	};

	const estimate = await kit.estimateSend(sendParams);
	console.log("Estimated Fees:", estimate);
	const result = await kit.send(sendParams);
	console.log(inspect(result, false, null, true));
}

sendTokens();
