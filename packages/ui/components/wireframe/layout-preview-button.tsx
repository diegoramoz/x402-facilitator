import { cn } from "../../lib/utils";

type LayoutPreviewButtonProps = {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode;
};

export function LayoutPreviewButton({
	selected,
	onClick,
	children,
}: LayoutPreviewButtonProps) {
	return (
		<button
			className={cn(
				"relative size-16 overflow-hidden rounded-md border-2 transition-all hover:scale-105",
				selected
					? "border-primary ring-2 ring-primary ring-offset-2"
					: "border-border hover:border-primary/50"
			)}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	);
}
