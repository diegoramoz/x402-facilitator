"use client";

import type { NavRoutes } from "../../hooks/use-nav-routes";
import { WireframeNav } from "../wireframe";
import { DesktopNavbar } from "./desktop-navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileTopNav } from "./mobile-top-nav";
import type { UserMenuProps } from "./user-menu";

export function Navigation({
	routes,
	userMenuProps,
}: {
	routes: NavRoutes;
	userMenuProps?: UserMenuProps;
}) {
	return (
		<>
			{/* Mobile: Top nav with logo only */}
			<WireframeNav hideOn="desktop" position="top">
				<MobileTopNav />
			</WireframeNav>

			{/* Mobile: Bottom nav with icons and user menu */}
			<WireframeNav hideOn="desktop" position="bottom">
				<MobileBottomNav routes={routes} userMenuProps={userMenuProps} />
			</WireframeNav>

			{/* Desktop: Top nav with full navbar */}
			<WireframeNav hideOn="mobile" position="top">
				<DesktopNavbar routes={routes} userMenuProps={userMenuProps} />
			</WireframeNav>
		</>
	);
}
