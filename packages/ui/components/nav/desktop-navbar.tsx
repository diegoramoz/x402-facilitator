"use client";

import Link from "next/link";
import { type NavRoutes, useNavRoutes } from "../../hooks/use-nav-routes";
import { cn } from "../../lib/utils";
import { NavLogoWithText } from "./nav-logo";
import type { UserMenuProps } from "./user-menu";
import { UserMenu } from "./user-menu";

export function DesktopNavbar({
	routes,
	userMenuProps,
}: {
	routes: NavRoutes;
	userMenuProps?: UserMenuProps;
}) {
	const activeRoutes = useNavRoutes(routes);
	return (
		<div
			className={cn(
				"flex h-full w-full items-center justify-between",
				"bg-background/95 backdrop-blur-md",
				"border-border/40 border-b",
				"px-4 md:px-6 lg:px-8",
				"shadow-sm"
			)}
		>
			<NavLogoWithText />
			<div />
			<nav className="flex h-full items-center gap-2 md:gap-4">
				{activeRoutes.map((route) => (
					<Link
						aria-current={route.isActive === true && "page"}
						className={cn(
							"group relative flex h-full min-w-[10ch] flex-none flex-col items-center justify-center gap-1.5 overflow-hidden px-3",
							"transition-all duration-200 ease-in-out",
							"hover:bg-muted/60",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							route.isActive
								? "bg-muted/40 font-semibold text-foreground"
								: "font-medium text-muted-foreground hover:text-foreground"
						)}
						href={route.href}
						key={`navbar-link-${route.href}`}
					>
						<route.icon
							aria-hidden="true"
							className={cn(
								"size-5 transition-transform duration-200",
								"group-hover:scale-110",
								route.isActive === true && "scale-105"
							)}
						/>
						<span className="text-xs tracking-wide">{route.name}</span>
						{route.isActive === true && (
							<span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-primary" />
						)}
					</Link>
				))}
				<div className="ml-2">
					<UserMenu {...userMenuProps} />
				</div>
			</nav>
		</div>
	);
}
