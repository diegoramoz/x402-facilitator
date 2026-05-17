import { env } from "@ramoz/env/finance";
import { toFacilitatorEvmSigner } from "@x402/evm";
import {
	createWalletClient,
	http,
	publicActions,
	type VerifyTypedDataParameters,
} from "viem";
import { type Address, privateKeyToAccount } from "viem/accounts";
import { chains, type SupportedChainIds } from "@/app/api/routers/chains";

const evmAccount = privateKeyToAccount(env.PRIVATE_KEY as Address);

export function generateEvmClient({ chain }: { chain: SupportedChainIds }) {
	const viemClient = createWalletClient({
		account: evmAccount,
		chain: chains[chain],
		transport: http(),
	}).extend(publicActions);

	const evmClient = toFacilitatorEvmSigner({
		getCode: viemClient.getCode,
		address: evmAccount.address,
		readContract: viemClient.readContract,
		verifyTypedData: (args) =>
			viemClient.verifyTypedData(args as VerifyTypedDataParameters),
		writeContract: viemClient.writeContract,
		sendTransaction: viemClient.sendTransaction,
		waitForTransactionReceipt: viemClient.waitForTransactionReceipt,
	});

	return evmClient;
}
