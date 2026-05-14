"use client";

import type React from "react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import {
	Wireframe,
	WireframeNav,
	WireframeSidebar,
	WireframeStickyNav,
} from "../wireframe";
import { useWireframeConfig } from "./wireframe-config-provider";

function ComponentName({ title, code }: { title: string; code: string }) {
	return (
		<Tooltip>
			<TooltipTrigger>
				<span className="rounded bg-background px-2 py-0.5 font-semibold">
					{title}
				</span>
			</TooltipTrigger>
			<TooltipContent>
				<span className="rounded px-1 font-mono text-sm">{code}</span>
			</TooltipContent>
		</Tooltip>
	);
}

function DemoSidebar({
	collapsed,
	onToggle,
	position,
}: {
	collapsed: boolean;
	onToggle: () => void;
	position: "left" | "right";
}) {
	const isLeft = position === "left";
	const title = isLeft ? "Left Sidebar" : "Right Sidebar";
	const code = `<WireframeSidebar position="${position}" collapsed={false} />`;
	const toggleArrow = isLeft === collapsed ? "→" : "←";

	return (
		<WireframeSidebar collapsed={collapsed} position={position}>
			<div className="min-h-full bg-blue-200 p-4 dark:bg-blue-900">
				<div
					className={cn(
						"mb-4 flex items-center justify-between",
						!isLeft && "flex-row-reverse",
						collapsed && "justify-center"
					)}
				>
					{!collapsed && <ComponentName code={code} title={title} />}
					<button
						className="p-2 hover:underline"
						onClick={onToggle}
						type="button"
					>
						{toggleArrow}
					</button>
				</div>
				{!collapsed && <div className="h-250 border border-border" />}
			</div>
		</WireframeSidebar>
	);
}

export function ConfigurableWireframe({
	children,
}: {
	children: React.ReactNode;
}) {
	const { config } = useWireframeConfig();
	const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
	const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

	return (
		<Wireframe
			config={{
				safeAreas: true,
				cssVariables: config.cssVariables,
				corners: config.corners,
			}}
		>
			{/* Render the appropriate nav type */}
			{config.navType === "normal" && (
				<>
					{config.showTopNav && (
						<WireframeNav position="top">
							<div className="flex h-full items-center justify-center bg-green-200 px-4 dark:bg-green-900">
								<ComponentName
									code={`<WireframeNav position="top"/>`}
									title="Top Navigation"
								/>
							</div>
						</WireframeNav>
					)}
					{config.showBottomNav && (
						<WireframeNav position="bottom">
							<div className="flex h-full items-center justify-center bg-purple-200 px-4 dark:bg-purple-900">
								<ComponentName
									code={`<WireframeNav position="bottom"/>`}
									title="Bottom Navigation"
								/>
							</div>
						</WireframeNav>
					)}
				</>
			)}

			{config.navType === "sticky" && (
				<WireframeStickyNav>
					<div className="flex h-full items-center justify-center bg-rose-200 px-4 dark:bg-rose-900">
						<ComponentName code={"<StickyNav />"} title="Sticky Navigation" />
					</div>
				</WireframeStickyNav>
			)}

			{config.showLeftSidebar && (
				<DemoSidebar
					collapsed={leftSidebarCollapsed}
					onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
					position="left"
				/>
			)}

			{config.showRightSidebar && (
				<DemoSidebar
					collapsed={rightSidebarCollapsed}
					onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
					position="right"
				/>
			)}

			{children}
		</Wireframe>
	);
}
