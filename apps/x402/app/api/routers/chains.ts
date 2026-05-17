import { arcTestnet, base, baseSepolia, type Chain } from "viem/chains";

export const supportedTestnetChains = [baseSepolia, arcTestnet] as const;
export type SupportedTestnetChain = (typeof supportedTestnetChains)[number];

export const supportedTestnetChainIds = supportedTestnetChains.map(
	(chain) => chain.id
);
export type SupportedTestnetChainIds =
	(typeof supportedTestnetChainIds)[number];

export const supportedMainnetChains = [base] as const;
export type SupportedMainnetChain = (typeof supportedMainnetChains)[number];

export const supportedMainnetChainIds = supportedMainnetChains.map(
	(chain) => chain.id
);
export type SupportedMainnetChainIds =
	(typeof supportedMainnetChainIds)[number];

export const supportedChainsArr = [
	...supportedMainnetChains,
	...supportedTestnetChains,
] as const;
export type SupportedChainsArr = (typeof supportedChainsArr)[number];

export const supportedChainIds = [
	...supportedMainnetChainIds,
	...supportedTestnetChainIds,
] as const;
export type SupportedChainIds = (typeof supportedChainIds)[number];

export const supportedChainsCAIP2 = supportedChainIds.map(
	(chain) => `eip155:${chain}` as const
);
export type SupportedChainCAIP2 = (typeof supportedChainsCAIP2)[number];

export const testnetChains = {
	84532: baseSepolia,
	5042002: arcTestnet,
} as const satisfies Record<SupportedTestnetChainIds, Chain>;

export const mainnetChains = {
	8453: base,
} as const satisfies Record<SupportedMainnetChainIds, Chain>;

// export const supportedChains = [
// 	...mainnetChains,
// 	...testnetChains,
// ] as const satisfies Record<SupportedChain, Chain>;

export const chains = {
	...mainnetChains,
	...testnetChains,
} as const satisfies Record<SupportedChainIds, Chain>;

export const supportedChainsMap = {
	"eip155:8453": base,
	"eip155:84532": baseSepolia,
	"eip155:5042002": arcTestnet,
} as const satisfies Record<SupportedChainCAIP2, Chain>;

//////////
// NETWORKS
/////////

export const supportedTestnetNetworks = [
	baseSepolia.network,
	"arc-testnet",
] as const;
export type SupportedTestnetNetworks =
	(typeof supportedTestnetNetworks)[number];

export const supportedMainnetNetworks = ["base"] as const;
export type SupportedMainnetNetworks =
	(typeof supportedMainnetNetworks)[number];

export const supportedNetworks = [
	...supportedMainnetNetworks,
	...supportedTestnetNetworks,
] as const;
export type SupportedNetworks = (typeof supportedNetworks)[number];

export const testnetNetworks = {
	"base-sepolia": baseSepolia,
	"arc-testnet": arcTestnet,
} as const satisfies Record<SupportedTestnetNetworks, Chain>;

export const mainnetNetworks = {
	base,
} as const satisfies Record<SupportedMainnetNetworks, Chain>;

export const networks = {
	...mainnetNetworks,
	...testnetNetworks,
} as const satisfies Record<SupportedNetworks, Chain>;
