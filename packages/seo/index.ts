import type { Metadata } from "next";
import { ImageResponse } from "next/og";
import { getOgFonts } from "./fonts";
import { buildMetadata } from "./metadata";
import { OgTemplate } from "./template";
import type { BrandConfig, PageInput } from "./types";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function createSeoConfig(config: BrandConfig) {
	function generateMetadata(page: PageInput): Metadata {
		return buildMetadata(page, config);
	}

	async function generateOgImage(page: PageInput): Promise<ImageResponse> {
		const fonts = await getOgFonts();
		return new ImageResponse(OgTemplate({ ...page, brand: config }), {
			...OG_SIZE,
			fonts,
		});
	}

	return { generateMetadata, generateOgImage };
}
