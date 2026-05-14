"use client";

import {
	Group as ResizablePrimitiveGroup,
	type GroupProps as ResizablePrimitiveGroupProps,
	Panel as ResizablePrimitivePanel,
	type PanelProps as ResizablePrimitivePanelProps,
	Separator as ResizablePrimitiveSeparator,
	type SeparatorProps as ResizablePrimitiveSeparatorProps,
} from "react-resizable-panels";
import { cn } from "../lib/utils";

function ResizablePanelGroup({
	className,
	...props
}: ResizablePrimitiveGroupProps) {
	return (
		<ResizablePrimitiveGroup
			className={cn(
				"flex h-full w-full aria-[orientation=vertical]:flex-col",
				className
			)}
			data-slot="resizable-panel-group"
			{...props}
		/>
	);
}

function ResizablePanel({ ...props }: ResizablePrimitivePanelProps) {
	return <ResizablePrimitivePanel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
	withHandle,
	className,
	...props
}: ResizablePrimitiveSeparatorProps & {
	withHandle?: boolean;
}) {
	return (
		<ResizablePrimitiveSeparator
			className={cn(
				"relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
				className
			)}
			data-slot="resizable-handle"
			{...props}
		>
			{withHandle && (
				<div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
			)}
		</ResizablePrimitiveSeparator>
	);
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
