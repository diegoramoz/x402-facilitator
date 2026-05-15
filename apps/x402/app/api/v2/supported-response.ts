export const SUPPORTED_RESPONSE = {
	x402Versions: [2],
	networks: [
		// { x402Version: 1, network: "base", name: "Base Mainnet", chainId: 8453 },
		// {
		// 	x402Version: 2,
		// 	network: "eip155:8453",
		// 	name: "Base Mainnet",
		// 	chainId: 8453,
		// },
		// {
		// 	x402Version: 1,
		// 	network: "arc",
		// 	name: "Arc Mainnet",
		// 	chainId: xxx,
		// },
		// {
		// 	x402Version: 2,
		// 	network: "eip155:xxx",
		// 	name: "Arc Mainnet",
		// 	chainId: xxx,
		// },
		// {
		// 	x402Version: 1,
		// 	network: "arc-testnet",
		// 	name: "Arc Testnet",
		// 	chainId: 5_042_002,
		// },
		{
			x402Version: 2,
			network: "eip155:5042002",
			name: "Arc Testnet",
			chainId: 5_042_002,
		},
	],
} as const;
