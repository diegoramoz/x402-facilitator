"use client";

import { cn } from "../../lib/utils";
import { NavLogoWithText } from "./nav-logo";

export function MobileTopNav() {
	return (
		<div
			className={cn(
				"flex h-full w-full items-center",
				"bg-background/95 backdrop-blur-md",
				"border-border/40 border-b",
				"px-4",
				"shadow-sm"
			)}
		>
			<NavLogoWithText />
		</div>
	);
}
