import { createSeoConfig } from "@ramoz/seo";

export const { generateMetadata, generateOgImage } = createSeoConfig({
	baseUrl: "https://ramoz.dev",
	primaryColor: "#6366f1",
	siteName: "Ramoz",
});
