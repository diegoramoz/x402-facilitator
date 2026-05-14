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

export type NavDiagramControlProps = {
	heightKey: WireframeCSSVariables;
	topOffsetKey?: WireframeCSSVariables;
	bottomOffsetKey?: WireframeCSSVariables;
	leftOffsetKey?: WireframeCSSVariables;
	rightOffsetKey?: WireframeCSSVariables;
	cssVariables: Partial<Record<WireframeCSSVariables, number>>;
	onUpdate: (key: WireframeCSSVariables, value: number) => void;
};

export function NavDiagramControl({
	heightKey,
	topOffsetKey,
	bottomOffsetKey,
	leftOffsetKey,
	rightOffsetKey,
	cssVariables,
	onUpdate,
}: NavDiagramControlProps) {
	return (
		<div className="grid grid-cols-[auto_1fr_auto] items-center gap-1">
			{/* Top row */}
			<div />
			<div className="flex justify-center py-1">
				{topOffsetKey ? (
					<DiagramSelect
						cssVariables={cssVariables}
						label="top offset"
						onUpdate={onUpdate}
						varKey={topOffsetKey}
					/>
				) : (
					<div className="h-12" />
				)}
			</div>
			<div />

			{/* Middle row — rectangle with height select inside */}
			<div className="flex justify-end pr-1">
				{leftOffsetKey ? (
					<DiagramSelect
						cssVariables={cssVariables}
						label="left offset"
						onUpdate={onUpdate}
						varKey={leftOffsetKey}
					/>
				) : null}
			</div>
			<div className="flex min-h-20 items-center justify-center rounded-md border border-border bg-muted px-3">
				<DiagramSelect
					cssVariables={cssVariables}
					label="height"
					onUpdate={onUpdate}
					varKey={heightKey}
				/>
			</div>
			<div className="flex justify-start pl-1">
				{rightOffsetKey ? (
					<DiagramSelect
						cssVariables={cssVariables}
						label="right offset"
						onUpdate={onUpdate}
						varKey={rightOffsetKey}
					/>
				) : null}
			</div>

			{/* Bottom row */}
			<div />
			<div className="flex justify-center py-1">
				{bottomOffsetKey ? (
					<DiagramSelect
						cssVariables={cssVariables}
						label="bottom offset"
						onUpdate={onUpdate}
						varKey={bottomOffsetKey}
					/>
				) : (
					<div className="h-12" />
				)}
			</div>
			<div />
		</div>
	);
}
