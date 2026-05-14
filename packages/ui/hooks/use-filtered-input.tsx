import type { RefObject } from "react";

/**
 * Hook that returns an onChange handler preserving cursor position when filtering input
 */
export function useFilteredInput<
	T extends HTMLInputElement | HTMLTextAreaElement,
>({
	ref,
	filter,
	onChange,
}: {
	ref: RefObject<T | null>;
	filter: (value: string) => string;
	onChange: (value: string) => void;
}) {
	return (e: React.ChangeEvent<T>) => {
		const element = e.target;
		const cursorPosition = element.selectionStart ?? 0;
		const oldValue = element.value;
		const newValue = filter(oldValue);

		// Calculate removed characters before cursor
		const removedBeforeCursor =
			oldValue.slice(0, cursorPosition).length -
			newValue.slice(0, cursorPosition).length;

		onChange(newValue);

		// Restore cursor position after React updates
		requestAnimationFrame(() => {
			if (ref?.current) {
				const newCursorPosition = Math.max(
					0,
					cursorPosition - removedBeforeCursor
				);
				ref.current.setSelectionRange(newCursorPosition, newCursorPosition);
			}
		});
	};
}
