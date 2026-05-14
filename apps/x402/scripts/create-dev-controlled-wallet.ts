import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { env } from "@ramoz/env/finance";
import {
	createPublicClient,
	getContract,
	http,
	keccak256,
	parseAbiItem,
	toHex,
} from "viem";
import { arcTestnet } from "viem/chains";
import z from "zod/v4";

import {
	AGENT_METADATA_URI,
	IDENTITY_REGISTRY,
	REPUTATION_REGISTRY,
	VALIDATION_REGISTRY,
} from "@/lib/constants";

const circleClient = initiateDeveloperControlledWalletsClient({
	apiKey: env.CIRCLE_API_KEY,
	entitySecret: env.CIRCLE_ENTITY_SECRET,
});

const publicClient = createPublicClient({
	chain: arcTestnet,
	transport: http(),
});

// Helper functions
async function waitForTransaction(txId: string, label: string) {
	process.stdout.write(`  Waiting for ${label}`);
	for (let i = 0; i < 30; i++) {
		await new Promise((r) => setTimeout(r, 2000));
		const { data } = await circleClient.getTransaction({ id: txId });
		if (data?.transaction?.state === "COMPLETE") {
			const txHash = data.transaction.txHash;
			console.log(` ✓\n  Tx: https://testnet.arcscan.app/tx/${txHash}`);
			return txHash;
		}
		if (data?.transaction?.state === "FAILED") {
			throw new Error(`${label} failed onchain`);
		}
		process.stdout.write(".");
	}
	throw new Error(`${label} timed out`);
}

// Main invocation
async function main() {
	console.log("\n── Step 1: Create wallets ──");

	const walletSet_ = await circleClient.createWalletSet({
		name: "ERC8004 Agent Wallets",
	});

	const walletSet = z
		.object({
			data: z.object({ walletSet: z.object({ id: z.string() }) }),
		})
		.parse(walletSet_);

	const walletsResponse = await circleClient.createWallets({
		blockchains: ["ARC-TESTNET"],
		count: 2,
		walletSetId: walletSet.data.walletSet.id,
		accountType: "SCA",
	});

	const ownerWallet = z
		.object({
			address: z.string(),
			id: z.string(),
		})
		.parse(walletsResponse.data?.wallets?.[0]);

	const validatorWallet = z
		.object({
			address: z.string(),
			id: z.string(),
		})
		.parse(walletsResponse.data?.wallets?.[1]);

	console.log(`  Owner:     ${ownerWallet.address} (${ownerWallet.id})`);
	console.log(
		`  Validator: ${validatorWallet.address} (${validatorWallet.id})`
	);

	console.log("\n── Step 2: Register agent identity ──");
	console.log(`  Metadata URI: ${AGENT_METADATA_URI}`);

	const registerTx_ = await circleClient.createContractExecutionTransaction({
		walletAddress: ownerWallet.address,
		blockchain: "ARC-TESTNET",
		contractAddress: IDENTITY_REGISTRY,
		abiFunctionSignature: "register(string)",
		abiParameters: [AGENT_METADATA_URI],
		fee: { type: "level", config: { feeLevel: "MEDIUM" } },
	});

	const registerTx = z
		.object({
			data: z.object({
				id: z.string(),
			}),
		})
		.parse(registerTx_);

	await waitForTransaction(registerTx.data?.id, "registration");

	console.log("\n── Step 3: Retrieve agent ID ──");

	const latestBlock = await publicClient.getBlockNumber();
	const blockRange = 10000n; // RPC limit: eth_getLogs is often capped at 10,000 blocks
	const fromBlock = latestBlock > blockRange ? latestBlock - blockRange : 0n;

	const transferLogs = await publicClient.getLogs({
		address: IDENTITY_REGISTRY,
		event: parseAbiItem(
			"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
		),
		args: { to: ownerWallet.address as `0x${string}` },
		fromBlock,
		toBlock: latestBlock,
	});

	if (transferLogs.length === 0) {
		throw new Error("No Transfer events found — registration may have failed");
	}

	const agentId = z
		.string()
		.parse(transferLogs.at(-1)?.args?.tokenId?.toString());

	const identityContract = getContract({
		address: IDENTITY_REGISTRY,
		abi: [
			{
				name: "ownerOf",
				type: "function",
				stateMutability: "view",
				inputs: [{ name: "tokenId", type: "uint256" }],
				outputs: [{ name: "", type: "address" }],
			},
			{
				name: "tokenURI",
				type: "function",
				stateMutability: "view",
				inputs: [{ name: "tokenId", type: "uint256" }],
				outputs: [{ name: "", type: "string" }],
			},
		],
		client: publicClient,
	});

	const owner = await identityContract.read.ownerOf([BigInt(agentId)]);
	const tokenURI = await identityContract.read.tokenURI([BigInt(agentId)]);

	console.log(`  Agent ID:     ${agentId}`);
	console.log(`  Owner:        ${owner}`);
	console.log(`  Metadata URI: ${tokenURI}`);

	console.log("\n── Step 4: Record reputation ──");

	const tag = "successful_trade";
	const feedbackHash = keccak256(toHex(tag));

	const reputationTx_ = await circleClient.createContractExecutionTransaction({
		walletAddress: validatorWallet.address,
		blockchain: "ARC-TESTNET",
		contractAddress: REPUTATION_REGISTRY,
		abiFunctionSignature:
			"giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)",
		abiParameters: [agentId, "95", "0", tag, "", "", "", feedbackHash],
		fee: { type: "level", config: { feeLevel: "MEDIUM" } },
	});

	const reputationTx = z
		.object({
			data: z.object({
				id: z.string(),
			}),
		})
		.parse(reputationTx_);

	await waitForTransaction(reputationTx.data?.id, "reputation");

	console.log("\n── Step 5: Verify reputation ──");

	const reputationLogs = await publicClient.getLogs({
		address: REPUTATION_REGISTRY,
		fromBlock: latestBlock - 1000n,
		toBlock: "latest",
	});

	console.log(`  Found ${reputationLogs.length} feedback event(s)`);

	// Owner requests; validator responds per ERC-8004
	console.log("\n── Step 6: Request validation ──");

	const requestURI = "ipfs://bafkreiexamplevalidationrequest";
	const requestHash = keccak256(
		toHex(`kyc_verification_request_agent_${agentId}`)
	);

	const validationReqTx_ =
		await circleClient.createContractExecutionTransaction({
			walletAddress: ownerWallet.address,
			blockchain: "ARC-TESTNET",
			contractAddress: VALIDATION_REGISTRY,
			abiFunctionSignature: "validationRequest(address,uint256,string,bytes32)",
			abiParameters: [
				validatorWallet.address,
				agentId,
				requestURI,
				requestHash,
			],
			fee: { type: "level", config: { feeLevel: "MEDIUM" } },
		});

	const validationReqTx = z
		.object({
			data: z.object({
				id: z.string(),
			}),
		})
		.parse(validationReqTx_);

	await waitForTransaction(validationReqTx.data?.id, "validation request");

	// Validator responds; 100 = passed, 0 = failed
	console.log("\n── Step 7: Validation response ──");

	const validationResTx_ =
		await circleClient.createContractExecutionTransaction({
			walletAddress: validatorWallet.address,
			blockchain: "ARC-TESTNET",
			contractAddress: VALIDATION_REGISTRY,
			abiFunctionSignature:
				"validationResponse(bytes32,uint8,string,bytes32,string)",
			abiParameters: [
				requestHash,
				"100",
				"",
				`0x${"0".repeat(64)}`,
				"kyc_verified",
			],
			fee: { type: "level", config: { feeLevel: "MEDIUM" } },
		});

	const validationResTx = z
		.object({
			data: z.object({
				id: z.string(),
			}),
		})
		.parse(validationResTx_);

	await waitForTransaction(validationResTx.data?.id, "validation response");

	console.log("\n── Step 8: Check validation ──");

	const validationContract = getContract({
		address: VALIDATION_REGISTRY,
		abi: [
			{
				name: "getValidationStatus",
				type: "function",
				stateMutability: "view",
				inputs: [{ name: "requestHash", type: "bytes32" }],
				outputs: [
					{ name: "validatorAddress", type: "address" },
					{ name: "agentId", type: "uint256" },
					{ name: "response", type: "uint8" },
					{ name: "responseHash", type: "bytes32" },
					{ name: "tag", type: "string" },
					{ name: "lastUpdate", type: "uint256" },
				],
			},
		],
		client: publicClient,
	});

	type ValidationStatus = readonly [
		`0x${string}`,
		bigint,
		number,
		`0x${string}`,
		string,
		bigint,
	];

	const [valAddr, , valResponse, , valTag] =
		(await validationContract.read.getValidationStatus([
			requestHash,
		])) as ValidationStatus;

	console.log(`  Validator:  ${valAddr}`);
	console.log(`  Response:   ${valResponse} (100 = passed)`);
	console.log(`  Tag:        ${valTag}`);

	console.log("\n── Complete ──");
	console.log("  ✓ Identity registered");
	console.log("  ✓ Reputation recorded");
	console.log("  ✓ Validation requested and verified");
	console.log(
		`\n  Explorer: https://testnet.arcscan.app/address/${ownerWallet.address}\n`
	);
}

main().catch((error) => {
	console.error("\nError:", error.message ?? error);
	process.exit(1);
});
