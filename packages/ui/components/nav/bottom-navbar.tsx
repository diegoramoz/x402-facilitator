"use client";

import { SiInstagram, SiX, SiYoutube } from "@icons-pack/react-simple-icons";
import { FINANCE_METADATA } from "@ramoz/shared/metadata/finance";
import Link from "next/link";

const socialMediaLinks = [
	{
		href: "/",
		name: "Instagram",
		icon: <SiInstagram className="size-6" />,
	},
	{ href: "/", name: "YouTube", icon: <SiYoutube className="size-6" /> },
	{ href: "/", name: "X", icon: <SiX className="size-6" /> },
] as const;

const sectionedLinks = [
	{
		title: "Company",
		links: [
			{ href: "/", label: "About Us" },
			{ href: "/", label: "Press" },
			{ href: "/", label: "Blog" },
		],
	},
	{
		title: "Product",
		links: [
			{ href: "/", label: "Features" },
			{ href: "/", label: "Pricing" },
			{ href: "/", label: "Docs" },
		],
	},
	{
		title: "Legal",
		links: [
			{ href: "/", label: "Privacy Policy" },
			{ href: "/", label: "Terms of Service" },
		],
	},
] as const;

export function BottomNavbar() {
	return (
		<footer className="w-full border-border/40 border-t bg-background/95 backdrop-blur-sm">
			<div className="container flex h-full w-full items-start justify-between gap-8 px-6 py-12 md:px-8">
				<div className="flex flex-col gap-4">
					<div className="font-bold text-xl tracking-tight">
						{FINANCE_METADATA.displayName}
					</div>
					<div className="flex gap-3">
						{socialMediaLinks.map(({ href, name, icon }) => (
							<Link
								aria-label={name}
								className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								href={href}
								key={href}
							>
								{icon}
							</Link>
						))}
					</div>
				</div>
				{sectionedLinks.map(({ title, links }) => (
					<div className="flex flex-col gap-4" key={title}>
						<div className="font-semibold text-sm tracking-wide">{title}</div>
						<div className="flex flex-col gap-2">
							{links.map(({ href, label }) => (
								<Link
									className="rounded-sm text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									href={href}
									key={href}
								>
									{label}
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
			<div className="border-border/40 border-t">
				<div className="container px-6 py-6 md:px-8">
					<p className="text-center text-muted-foreground text-sm">
						© {new Date().getFullYear()} {FINANCE_METADATA.displayName}. All
						rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
