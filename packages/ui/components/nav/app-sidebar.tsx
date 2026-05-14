import {
	BarChart3,
	Database,
	FileText,
	FolderOpen,
	Gauge,
	LayoutList,
	type LucideIcon,
	MoreHorizontal,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Item, ItemGroup, ItemMedia, ItemSeparator } from "../item";
import {
	WireframeSidebar,
	WireframeSidebarContent,
	WireframeSidebarGroup,
	WireframeSidebarHeader,
} from "../wireframe";
import { NavLogoWithText } from "./nav-logo";

type SidebarItem = {
	name: string;
	icon: LucideIcon;
	href: string;
};

type SidebarSection = {
	title: string;
	items: SidebarItem[];
};

const sections: SidebarSection[] = [
	{
		title: "Home",
		items: [
			{ name: "Dashboard", icon: Gauge, href: "/dashboard" },
			{ name: "Lifecycle", icon: LayoutList, href: "/lifecycle" },
			{ name: "Analytics", icon: BarChart3, href: "/analytics" },
			{ name: "Projects", icon: FolderOpen, href: "/projects" },
			{ name: "Team", icon: Users, href: "/team" },
		],
	},
	{
		title: "Documents",
		items: [
			{ name: "Data Library", icon: Database, href: "/data-library" },
			{ name: "Reports", icon: FileText, href: "/reports" },
			{ name: "Word Assistant", icon: FileText, href: "/word-assistant" },
			{ name: "More", icon: MoreHorizontal, href: "/more" },
		],
	},
];

export function AppSidebar() {
	return (
		<WireframeSidebar className="border-r bg-background" position="left">
			<WireframeSidebarHeader className="p-3">
				<div className="px-2 py-3">
					<NavLogoWithText />
				</div>
			</WireframeSidebarHeader>

			<WireframeSidebarContent className="p-3">
				<nav className="flex flex-col gap-1">
					{sections.map((section, i) => (
						<WireframeSidebarGroup key={section.title}>
							{i > 0 && <ItemSeparator />}
							<ItemGroup>
								<p className="px-3 py-1 font-medium text-muted-foreground text-xs">
									{section.title}
								</p>
								{section.items.map((item) => (
									<Item
										className="hover:bg-muted"
										key={item.name}
										render={<Link href={item.href} />}
										size="sm"
									>
										<ItemMedia variant="icon">
											<item.icon className="size-4 text-muted-foreground" />
										</ItemMedia>
										<span className="text-sm">{item.name}</span>
									</Item>
								))}
							</ItemGroup>
						</WireframeSidebarGroup>
					))}
				</nav>
			</WireframeSidebarContent>
		</WireframeSidebar>
	);
}
