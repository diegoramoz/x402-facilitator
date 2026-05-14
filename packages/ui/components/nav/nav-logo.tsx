import { FINANCE_METADATA } from "@ramoz/shared/metadata/finance";
import Image from "next/image";

function NavLogo() {
	return (
		<Image
			alt={`${FINANCE_METADATA.displayName} Logo`}
			className="aspect-square w-10 object-contain"
			height={472}
			src="/logo.png"
			width={472}
		/>
	);
}

export function NavLogoWithText() {
	return (
		<div className="flex items-center gap-3">
			<NavLogo />
			<div className="font-semibold text-xl">
				{FINANCE_METADATA.displayName}
			</div>
		</div>
	);
}
