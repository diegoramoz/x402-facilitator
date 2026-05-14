"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import type { WireframeCSSVariables } from "../wireframe";

type NavType = "normal" | "sticky";
export type WireframeCornerOptions = "navbar" | "sidebar";

export type WireframeConfig = {
	navType: NavType;
	showTopNav: boolean;
	showBottomNav: boolean;
	showLeftSidebar: boolean;
	showRightSidebar: boolean;
	corners: {
		topLeft: WireframeCornerOptions;
		topRight: WireframeCornerOptions;
		bottomLeft: WireframeCornerOptions;
		bottomRight: WireframeCornerOptions;
	};
	cssVariables: Partial<Record<WireframeCSSVariables, number>>;
};

type WireframeConfigContextType = {
	config: WireframeConfig;
	updateConfig: <K extends keyof WireframeConfig>(
		key: K,
		value: WireframeConfig[K]
	) => void;
	updateCSSVariable: (key: WireframeCSSVariables, value: number) => void;
	updateCorner: (
		corner: keyof WireframeConfig["corners"],
		value: WireframeCornerOptions
	) => void;
};

const WireframeConfigContext = createContext<
	WireframeConfigContextType | undefined
>(undefined);

export const defaultCSSVariables: Partial<
	Record<WireframeCSSVariables, number>
> = {
	// STICKY NAV
	"--sticky-nav-height": 12,
	"--sticky-nav-top-offset": 0,

	// TOP NAV
	"--top-nav-height": 16,
	"--top-nav-left-offset": 0,
	"--top-nav-right-offset": 0,
	"--top-nav-top-offset": 0,
	"--top-nav-bottom-offset": 0,

	// BOTTOM NAV
	"--bottom-nav-height": 8,
	"--bottom-nav-left-offset": 0,
	"--bottom-nav-right-offset": 0,
	"--bottom-nav-top-offset": 0,
	"--bottom-nav-bottom-offset": 0,

	// LEFT SIDEBAR
	"--left-sidebar-width-collapsed": 16,
	"--left-sidebar-width-expanded": 52,
	"--left-sidebar-left-offset": 0,
	"--left-sidebar-right-offset": 0,
	"--left-sidebar-top-offset": 0,
	"--left-sidebar-bottom-offset": 0,

	// RIGHT SIDEBAR
	"--right-sidebar-width-expanded": 52,
	"--right-sidebar-width-collapsed": 16,
	"--right-sidebar-left-offset": 0,
	"--right-sidebar-right-offset": 0,
	"--right-sidebar-top-offset": 0,
	"--right-sidebar-bottom-offset": 0,
};

export function WireframeConfigProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [config, setConfig] = useState<WireframeConfig>({
		navType: "normal",
		showTopNav: true,
		showBottomNav: false,
		showLeftSidebar: true,
		showRightSidebar: false,
		corners: {
			topLeft: "sidebar",
			topRight: "sidebar",
			bottomLeft: "sidebar",
			bottomRight: "sidebar",
		},
		cssVariables: defaultCSSVariables,
	});

	const updateConfig = <K extends keyof WireframeConfig>(
		key: K,
		value: WireframeConfig[K]
	) => {
		setConfig((prev) => ({ ...prev, [key]: value }));
	};

	const updateCSSVariable = (key: WireframeCSSVariables, value: number) => {
		setConfig((prev) => ({
			...prev,
			cssVariables: {
				...prev.cssVariables,
				[key]: value,
			},
		}));
	};

	const updateCorner = (
		corner: keyof WireframeConfig["corners"],
		value: WireframeCornerOptions
	) => {
		setConfig((prev) => ({
			...prev,
			corners: {
				...prev.corners,
				[corner]: value,
			},
		}));
	};

	return (
		<WireframeConfigContext.Provider
			value={{
				config,
				updateConfig,
				updateCSSVariable,
				updateCorner,
			}}
		>
			{children}
		</WireframeConfigContext.Provider>
	);
}

export function useWireframeConfig() {
	const context = useContext(WireframeConfigContext);
	if (!context) {
		throw new Error(
			"useWireframeConfig must be used within WireframeConfigProvider"
		);
	}
	return context;
}
