import type { Metadata } from "next";
import type { BrandConfig, PageInput } from "./types.js";

export function buildMetadata(page: PageInput, brand: BrandConfig): Metadata {
	const url = page.path ? `${brand.baseUrl}${page.path}` : brand.baseUrl;
	const title = page.title;

	return {
		title,
		description: page.description,
		metadataBase: new URL(brand.baseUrl),
		alternates: {
			canonical: url,
		},
		openGraph: {
			title,
			description: page.description,
			url,
			siteName: brand.siteName,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: page.description,
		},
		robots: {
			index: true,
			follow: true,
		},
		...(brand.logoUrl && { other: { "og:logo": brand.logoUrl } }),
	};
}
