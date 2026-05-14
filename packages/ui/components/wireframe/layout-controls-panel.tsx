"use client";

import { Label } from "../label";
import { CornerControl } from "./corner-control";
import { NavControl } from "./nav-control";
import { NavDiagramControl } from "./nav-diagram-control";
import { SidebarControl } from "./sidebar-control";
import { SidebarDiagramControl } from "./sidebar-diagram-control";
import type { WireframeConfig } from "./wireframe-config-provider";
import { useWireframeConfig } from "./wireframe-config-provider";

type NavCornersSectionProps = {
	config: WireframeConfig;
	updateCorner: ReturnType<typeof useWireframeConfig>["updateCorner"];
};

function NavCornersSection({ config, updateCorner }: NavCornersSectionProps) {
	const hasTopLeft = config.showTopNav && config.showLeftSidebar;
	const hasTopRight = config.showTopNav && config.showRightSidebar;
	const hasBottomLeft = config.showBottomNav && config.showLeftSidebar;
	const hasBottomRight = config.showBottomNav && config.showRightSidebar;

	if (!(hasTopLeft || hasTopRight || hasBottomLeft || hasBottomRight)) {
		return null;
	}

	return (
		<div className="space-y-2">
			<Label className="font-semibold text-sm">Nav Corners</Label>
			<div className="grid grid-cols-2 gap-6">
				{hasTopLeft && (
					<CornerControl
						corner="topLeft"
						onSelect={(value) => updateCorner("topLeft", value)}
						selected={config.corners.topLeft}
					/>
				)}
				{hasTopRight && (
					<CornerControl
						corner="topRight"
						onSelect={(value) => updateCorner("topRight", value)}
						selected={config.corners.topRight}
					/>
				)}
				{hasBottomLeft && (
					<CornerControl
						corner="bottomLeft"
						onSelect={(value) => updateCorner("bottomLeft", value)}
						selected={config.corners.bottomLeft}
					/>
				)}
				{hasBottomRight && (
					<CornerControl
						corner="bottomRight"
						onSelect={(value) => updateCorner("bottomRight", value)}
						selected={config.corners.bottomRight}
					/>
				)}
			</div>
		</div>
	);
}

export function LayoutControlsPanel() {
	const { config, updateConfig, updateCSSVariable, updateCorner } =
		useWireframeConfig();

	const vars = config.cssVariables;

	return (
		<div className="space-y-6">
			{/* Nav Type Selection */}
			<div className="space-y-2">
				<Label className="font-semibold text-sm">Navigation Type</Label>
				<div className="flex flex-wrap justify-start gap-3">
					<NavControl
						enabled={config.navType === "normal" && config.showTopNav}
						label="Top Nav"
						onToggle={() => {
							if (config.navType === "normal") {
								updateConfig("showTopNav", !config.showTopNav);
							} else {
								updateConfig("navType", "normal");
								updateConfig("showTopNav", true);
							}
						}}
						type="top"
					/>
					<NavControl
						enabled={config.navType === "normal" && config.showBottomNav}
						label="Bottom Nav"
						onToggle={() => {
							if (config.navType === "normal") {
								updateConfig("showBottomNav", !config.showBottomNav);
							} else {
								updateConfig("navType", "normal");
								updateConfig("showBottomNav", true);
							}
						}}
						type="bottom"
					/>
					<NavControl
						enabled={config.navType === "sticky"}
						label="Sticky"
						onToggle={() => updateConfig("navType", "sticky")}
						type="sticky"
					/>
				</div>
			</div>

			{/* Sidebar Controls */}
			<div className="space-y-3">
				<Label className="font-semibold text-sm">Sidebars</Label>
				<div className="flex gap-3">
					<div className="flex flex-col items-center gap-1">
						<SidebarControl
							enabled={config.showLeftSidebar}
							onToggle={() =>
								updateConfig("showLeftSidebar", !config.showLeftSidebar)
							}
							side="left"
						/>
						<Label className="text-xs">Left</Label>
					</div>
					<div className="flex flex-col items-center gap-1">
						<SidebarControl
							enabled={config.showRightSidebar}
							onToggle={() =>
								updateConfig("showRightSidebar", !config.showRightSidebar)
							}
							side="right"
						/>
						<Label className="text-xs">Right</Label>
					</div>
				</div>
			</div>

			{/* Nav Corners (for normal nav) */}
			{config.navType === "normal" && (
				<NavCornersSection config={config} updateCorner={updateCorner} />
			)}

			{/* CSS Variable Diagrams */}
			<div className="space-y-6">
				{config.navType === "sticky" && (
					<div className="space-y-2">
						<Label className="font-medium text-muted-foreground text-xs">
							Sticky Nav
						</Label>
						<NavDiagramControl
							cssVariables={vars}
							heightKey="--sticky-nav-height"
							onUpdate={updateCSSVariable}
							topOffsetKey="--sticky-nav-top-offset"
						/>
					</div>
				)}

				{config.navType === "normal" && config.showTopNav && (
					<div className="space-y-2">
						<Label className="font-medium text-muted-foreground text-xs">
							Top Nav
						</Label>
						<NavDiagramControl
							bottomOffsetKey="--top-nav-bottom-offset"
							cssVariables={vars}
							heightKey="--top-nav-height"
							leftOffsetKey="--top-nav-left-offset"
							onUpdate={updateCSSVariable}
							rightOffsetKey="--top-nav-right-offset"
							topOffsetKey="--top-nav-top-offset"
						/>
					</div>
				)}

				{config.navType === "normal" && config.showBottomNav && (
					<div className="space-y-2">
						<Label className="font-medium text-muted-foreground text-xs">
							Bottom Nav
						</Label>
						<NavDiagramControl
							bottomOffsetKey="--bottom-nav-bottom-offset"
							cssVariables={vars}
							heightKey="--bottom-nav-height"
							leftOffsetKey="--bottom-nav-left-offset"
							onUpdate={updateCSSVariable}
							rightOffsetKey="--bottom-nav-right-offset"
							topOffsetKey="--bottom-nav-top-offset"
						/>
					</div>
				)}

				{config.showLeftSidebar && (
					<div className="space-y-2">
						<Label className="font-medium text-muted-foreground text-xs">
							Left Sidebar
						</Label>
						<SidebarDiagramControl
							bottomOffsetKey="--left-sidebar-bottom-offset"
							collapsedWidthKey="--left-sidebar-width-collapsed"
							cssVariables={vars}
							expandedWidthKey="--left-sidebar-width-expanded"
							leftOffsetKey="--left-sidebar-left-offset"
							onUpdate={updateCSSVariable}
							rightOffsetKey="--left-sidebar-right-offset"
							topOffsetKey="--left-sidebar-top-offset"
						/>
					</div>
				)}

				{config.showRightSidebar && (
					<div className="space-y-2">
						<Label className="font-medium text-muted-foreground text-xs">
							Right Sidebar
						</Label>
						<SidebarDiagramControl
							bottomOffsetKey="--right-sidebar-bottom-offset"
							collapsedWidthKey="--right-sidebar-width-collapsed"
							cssVariables={vars}
							expandedWidthKey="--right-sidebar-width-expanded"
							leftOffsetKey="--right-sidebar-left-offset"
							onUpdate={updateCSSVariable}
							rightOffsetKey="--right-sidebar-right-offset"
							topOffsetKey="--right-sidebar-top-offset"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
