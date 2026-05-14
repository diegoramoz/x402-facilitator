"use client";

import Link from "next/link";
import { type NavRoutes, useNavRoutes } from "../../hooks/use-nav-routes";
import { cn } from "../../lib/utils";
import type { UserMenuProps } from "./user-menu";
import { UserMenu } from "./user-menu";

export function MobileBottomNav({
	routes,
	userMenuProps,
}: {
	routes: NavRoutes;
	userMenuProps?: UserMenuProps;
}) {
	const activeRoutes = useNavRoutes(routes);

	return (
		<nav className="flex h-full w-full touch-none items-center justify-evenly border-border/40 border-t bg-background/95 px-2 backdrop-blur-md">
			{activeRoutes.map((route) => (
				<Link
					aria-current={route.isActive === true && "page"}
					className={cn(
						"group relative flex flex-1 flex-col items-center justify-center gap-1 py-2",
						"transition-all duration-200 ease-in-out",
						"rounded-lg hover:bg-muted/60",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						route.isActive
							? "font-semibold text-foreground"
							: "font-medium text-muted-foreground hover:text-foreground"
					)}
					href={route.href}
					key={`mobile-bottom-nav-${route.href}`}
				>
					<route.icon
						aria-hidden="true"
						className={cn(
							"size-5 transition-transform duration-200",
							"group-hover:scale-110",
							route.isActive === true && "scale-105 text-primary"
						)}
					/>
					<span className="text-[10px] leading-tight tracking-wide">
						{route.name}
					</span>
					{route.isActive === true && (
						<span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
					)}
				</Link>
			))}

			<div className="flex flex-1 flex-col items-center justify-center py-2">
				<UserMenu {...userMenuProps} />
			</div>
		</nav>
	);
}
