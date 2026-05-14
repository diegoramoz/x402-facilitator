import { cn } from "../../lib/utils";

type NavControlProps = {
	type: "top" | "bottom" | "sticky" | "responsive";
	enabled: boolean;
	onToggle: () => void;
	label: string;
};

export function NavControl({
	type,
	enabled,
	onToggle,
	label,
}: NavControlProps) {
	const renderNav = () => {
		switch (type) {
			case "top":
				return (
					<div className="flex size-full flex-col">
						<div className="h-[30%] w-full bg-green-500" />
						<div className="h-[70%] w-full" />
					</div>
				);
			case "bottom":
				return (
					<div className="flex size-full flex-col">
						<div className="h-[70%] w-full" />
						<div className="h-[30%] w-full bg-purple-500" />
					</div>
				);
			case "sticky":
				return (
					<div className="flex size-full flex-col">
						<div className="h-[25%] w-full bg-rose-500" />
						<div className="h-[75%] w-full" />
					</div>
				);
			case "responsive":
				return (
					<div className="flex size-full flex-col">
						<div className="h-[20%] w-full bg-yellow-500" />
						<div className="h-[60%] w-full" />
						<div className="h-[20%] w-full bg-yellow-500" />
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col items-center gap-1">
			<span className="font-medium text-xs">{label}</span>
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
				{renderNav()}
			</button>
		</div>
	);
}
