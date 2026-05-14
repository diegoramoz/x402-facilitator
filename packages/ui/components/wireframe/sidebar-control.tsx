import { cn } from "../../lib/utils";

type SidebarControlProps = {
	side: "left" | "right";
	enabled: boolean;
	onToggle: () => void;
};

export function SidebarControl({
	side,
	enabled,
	onToggle,
}: SidebarControlProps) {
	const isLeft = side === "left";

	return (
		<button
			className={cn(
				"relative size-16 overflow-hidden rounded-md border-2 bg-background transition-all hover:scale-105",
				enabled
					? "border-primary ring-2 ring-primary ring-offset-2"
					: "border-border hover:border-primary/50"
			)}
			onClick={onToggle}
			type="button"
		>
			<div className="flex size-full">
				{/* Left sidebar */}
				{isLeft && <div className="h-full w-[30%] bg-blue-500" />}

				{/* Middle content */}
				<div className="h-full flex-1" />

				{/* Right sidebar */}
				{!isLeft && <div className="h-full w-[30%] bg-blue-500" />}
			</div>
		</button>
	);
}
