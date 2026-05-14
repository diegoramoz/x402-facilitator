const INTER_REGULAR =
	"https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff";
const INTER_BOLD =
	"https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff";

export async function getOgFonts(): Promise<
	{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
	const [regular, bold] = await Promise.all([
		fetch(INTER_REGULAR).then((r) => r.arrayBuffer()),
		fetch(INTER_BOLD).then((r) => r.arrayBuffer()),
	]);

	return [
		{ name: "Inter", data: regular, weight: 400, style: "normal" },
		{ name: "Inter", data: bold, weight: 700, style: "normal" },
	];
}
