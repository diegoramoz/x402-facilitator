"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type NavRoute, useNavRoutes } from "../../hooks/use-nav-routes";
import { cn } from "../../lib/utils";
import { Item, ItemGroup, ItemMedia } from "../item";
import {
	WireframeSidebar,
	WireframeSidebarContent,
	WireframeSidebarFooter,
	WireframeSidebarHeader,
} from "../wireframe";

export function Sidebar({
	routes,
	title,
	shortDesc,
	github,
}: {
	routes: readonly NavRoute[];
	title: string;
	shortDesc: string;
	github: string;
}) {
	const activeRoutes = useNavRoutes(routes);

	return (
		<WireframeSidebar
			className="border-r bg-background"
			hideOn="mobile"
			position="left"
		>
			<WireframeSidebarHeader className="p-3">
				<div className="px-3 py-2">
					<Link
						className="mb-2 flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
						href="/"
					>
						<ArrowLeft className="size-3" />
						Home
					</Link>
					<p className="font-semibold text-sm">{title}</p>
					<p className="text-muted-foreground text-xs">{shortDesc}</p>
				</div>
			</WireframeSidebarHeader>

			<WireframeSidebarContent className="p-3">
				<nav className="flex flex-col gap-1">
					<ItemGroup>
						{activeRoutes.map((route) => {
							return (
								<Item
									className={cn(
										"hover:bg-muted",
										route.isActive && "bg-muted font-medium"
									)}
									key={route.href}
									render={<Link href={route.href} />}
									size="sm"
								>
									<ItemMedia variant="icon">
										<route.icon
											className={cn(
												"size-4",
												route.isActive
													? "text-foreground"
													: "text-muted-foreground"
											)}
										/>
									</ItemMedia>
									<span
										className={cn(
											"text-sm",
											route.isActive
												? "text-foreground"
												: "text-muted-foreground"
										)}
									>
										{route.name}
									</span>
								</Item>
							);
						})}
					</ItemGroup>
				</nav>
			</WireframeSidebarContent>

			<WireframeSidebarFooter className="p-3">
				<a
					className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
					href={github}
					rel="noopener noreferrer"
					target="_blank"
				>
					<SiGithub className="size-4 shrink-0" />
					<span>View on GitHub</span>
				</a>
			</WireframeSidebarFooter>
		</WireframeSidebar>
	);
}
