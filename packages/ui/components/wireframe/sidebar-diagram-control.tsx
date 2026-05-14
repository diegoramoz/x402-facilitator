"use client";

import { NativeSelect, NativeSelectOption } from "../native-select";
import type { WireframeCSSVariables } from "../wireframe";

const SPACING_OPTIONS = [
	0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 52, 56, 64,
];

type DiagramSelectProps = {
	label: string;
	varKey: WireframeCSSVariables;
	cssVariables: Partial<Record<WireframeCSSVariables, number>>;
	onUpdate: (key: WireframeCSSVariables, value: number) => void;
};

function DiagramSelect({
	label,
	varKey,
	cssVariables,
	onUpdate,
}: DiagramSelectProps) {
	const current = cssVariables[varKey] ?? 0;
	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-muted-foreground text-xs">{label}</span>
			<NativeSelect
				onChange={(e) => onUpdate(varKey, Number(e.target.value))}
				size="sm"
				value={current}
			>
				{SPACING_OPTIONS.map((v) => (
					<NativeSelectOption key={v} value={v}>
						{v}
					</NativeSelectOption>
				))}
			</NativeSelect>
		</div>
	);
}

export type SidebarDiagramControlProps = {
	collapsedWidthKey: WireframeCSSVariables;
	expandedWidthKey: WireframeCSSVariables;
	topOffsetKey: WireframeCSSVariables;
	bottomOffsetKey: WireframeCSSVariables;
	leftOffsetKey: WireframeCSSVariables;
	rightOffsetKey: WireframeCSSVariables;
	cssVariables: Partial<Record<WireframeCSSVariables, number>>;
	onUpdate: (key: WireframeCSSVariables, value: number) => void;
};

export function SidebarDiagramControl({
	collapsedWidthKey,
	expandedWidthKey,
	topOffsetKey,
	bottomOffsetKey,
	leftOffsetKey,
	rightOffsetKey,
	cssVariables,
	onUpdate,
}: SidebarDiagramControlProps) {
	return (
		<div className="grid grid-cols-[auto_auto_auto] items-center gap-1">
			{/* Top row */}
			<div />
			<div className="flex justify-center py-1">
				<DiagramSelect
					cssVariables={cssVariables}
					label="top offset"
					onUpdate={onUpdate}
					varKey={topOffsetKey}
				/>
			</div>
			<div />

			{/* Middle row — rectangle with collapsed + expanded width selects inside */}
			<div className="flex justify-end pr-1">
				<DiagramSelect
					cssVariables={cssVariables}
					label="left offset"
					onUpdate={onUpdate}
					varKey={leftOffsetKey}
				/>
			</div>
			<div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-md border border-border bg-muted px-3 py-4">
				<DiagramSelect
					cssVariables={cssVariables}
					label="collapsed"
					onUpdate={onUpdate}
					varKey={collapsedWidthKey}
				/>
				<DiagramSelect
					cssVariables={cssVariables}
					label="expanded"
					onUpdate={onUpdate}
					varKey={expandedWidthKey}
				/>
			</div>
			<div className="flex justify-start pl-1">
				<DiagramSelect
					cssVariables={cssVariables}
					label="right offset"
					onUpdate={onUpdate}
					varKey={rightOffsetKey}
				/>
			</div>

			{/* Bottom row */}
			<div />
			<div className="flex justify-center py-1">
				<DiagramSelect
					cssVariables={cssVariables}
					label="bottom offset"
					onUpdate={onUpdate}
					varKey={bottomOffsetKey}
				/>
			</div>
			<div />
		</div>
	);
}
