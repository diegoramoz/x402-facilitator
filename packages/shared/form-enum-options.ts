import type { ZodType } from "zod/v4";

type AnyDef = {
	type: string;
	entries?: Record<string, string>;
	innerType?: unknown;
};

function findEnumDef(schema: ZodType): { entries: Record<string, string> } {
	const def = (schema as unknown as { _zod: { def: AnyDef } })._zod.def;

	if (def.type === "enum" && def.entries) {
		return def as { entries: Record<string, string> };
	}

	const wrappedTypes = ["default", "prefault", "optional", "nullable", "catch"];
	if (wrappedTypes.includes(def.type) && def.innerType) {
		return findEnumDef(def.innerType as ZodType);
	}

	throw new Error("getEnumOptions: schema must be a z.enum()");
}

export function getEnumOptions(
	schema: ZodType,
	labelMap?: Record<string, string>
): { value: string; label: string }[] {
	const { entries } = findEnumDef(schema);

	return Object.keys(entries).map((value) => ({
		value,
		label:
			labelMap?.[value] ??
			value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
	}));
}
