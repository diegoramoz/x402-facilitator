import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../../");

const serverSrc = readFileSync(resolve(__dirname, "server.ts"), "utf8");

const serverBlock = serverSrc.match(/server\s*:\s*\{([\s\S]*?)\},/)?.[1] ?? "";
const envKeys = [
	...serverBlock.matchAll(/^\s*["']?([A-Z_][A-Z0-9_]*)["']?\s*:/gm),
]
	.map((m) => m[1])
	.filter((k): k is string => Boolean(k));

if (envKeys.length === 0) {
	console.error("check-turbo-sync: could not parse any keys from server.ts");
	process.exit(1);
}

const turboJson = JSON.parse(
	readFileSync(resolve(root, "turbo.json"), "utf8")
) as { globalEnv?: string[] };
const globalEnv = new Set(turboJson.globalEnv ?? []);

// NODE_ENV is intentionally excluded from globalEnv (framework-inferred)
const missing = envKeys.filter((k) => k !== "NODE_ENV" && !globalEnv.has(k));
const extra = [...globalEnv].filter((k) => !envKeys.includes(k));

let ok = true;

if (missing.length > 0) {
	console.error(
		`check-turbo-sync: in server.ts but MISSING from turbo.json globalEnv:\n  ${missing.join("\n  ")}`
	);
	ok = false;
}

if (extra.length > 0) {
	console.warn(
		`check-turbo-sync: in turbo.json globalEnv but NOT in server.ts (may be intentional):\n  ${extra.join("\n  ")}`
	);
}

if (ok) {
	console.log(
		"check-turbo-sync: turbo.json globalEnv is in sync with server.ts ✓"
	);
}

process.exit(ok ? 0 : 1);
