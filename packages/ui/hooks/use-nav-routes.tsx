"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import { usePathname } from "next/navigation";

/**
 * Navigation route configuration
 */
export type NavRoute = {
	/** The URL path for this route */
	href: Route<string>;
	description?: string;
	/** Display name for the navigation item */
	name: string;
	/** Icon component to display */
	icon: LucideIcon;
	/**
	 * Array of path patterns that should mark this item as active
	 * Supports exact matches and wildcards (e.g., "/contracts/*")
	 */
	activePatterns: (Route<string> | `${Route<string>}/*`)[];
};

/** Generic array of nav routes — define your own in each app */
export type NavRoutes = readonly NavRoute[];

/**
 * Check if a pathname matches any of the active patterns
 * @param pathname Current pathname
 * @param patterns Array of patterns to match against
 * @returns true if the pathname matches any pattern
 */
export function isRouteActive(pathname: string, patterns: readonly string[]) {
	return patterns.some((pattern) => {
		// Exact match
		if (pattern === pathname) {
			return true;
		}

		// Wildcard match (e.g., "/contracts/*" matches "/contracts/123")
		if (pattern.endsWith("/*")) {
			const basePattern = pattern.slice(0, -2);
			return pathname === basePattern || pathname.startsWith(`${basePattern}/`);
		}

		return false;
	});
}

export type ActiveNavRoute<T extends NavRoute = NavRoute> = T & {
	isActive: boolean;
};

/**
 * Enriches a list of nav routes with the current active state.
 * Import this hook in any app to get standardized active-route detection
 * without coupling your navbar styles to a shared component.
 *
 * @example
 * const routes = useNavRoutes(MY_APP_ROUTES);
 * // Each route now has `isActive: boolean` — render however you like.
 */
export function useNavRoutes<T extends NavRoute>(
	routes: readonly T[]
): ActiveNavRoute<T>[] {
	const pathname = usePathname();
	return routes.map((route) => ({
		...route,
		isActive: isRouteActive(pathname, route.activePatterns),
	}));
}
