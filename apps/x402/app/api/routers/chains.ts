import { arcTestnet, base, baseSepolia, type Chain } from "viem/chains";

export const supportedTestnetChains = [baseSepolia.id, arcTestnet.id] as const;
export type SupportedTestnetChain = (typeof supportedTestnetChains)[number];

export const supportedMainnetChains = [base.id] as const;
export type SupportedMainnetChain = (typeof supportedMainnetChains)[number];

export const supportedChains = [
	...supportedMainnetChains,
	...supportedTestnetChains,
] as const;
export type SupportedChain = (typeof supportedChains)[number];

export const testnetChains = {
	84532: baseSepolia,
	5042002: arcTestnet,
} as const satisfies Record<SupportedTestnetChain, Chain>;

export const mainnetChains = {
	8453: base,
} as const satisfies Record<SupportedMainnetChain, Chain>;

export const chains = {
	...mainnetChains,
	...testnetChains,
} as const satisfies Record<SupportedChain, Chain>;

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
