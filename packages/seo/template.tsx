import type { BrandConfig, PageInput } from "./types.js";

export function OgTemplate({
	title,
	description,
	brand,
}: PageInput & { brand: BrandConfig }) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "flex-end",
				padding: "60px",
				backgroundColor: "#0a0a0a",
				position: "relative",
				fontFamily: "Inter",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "6px",
					backgroundColor: brand.primaryColor,
				}}
			/>

			<div
				style={{
					position: "absolute",
					top: "60px",
					left: "60px",
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}
			>
				{brand.logoUrl ? (
					// biome-ignore lint/performance/noImgElement: satori requires <img>, not next/image
					<img
						alt={brand.siteName}
						height={40}
						src={brand.logoUrl}
						style={{ borderRadius: "8px" }}
						width={40}
					/>
				) : null}
				<span
					style={{
						fontSize: "20px",
						fontWeight: 700,
						color: "#ffffff",
						opacity: 0.5,
					}}
				>
					{brand.siteName}
				</span>
			</div>

			<div
				style={{
					fontSize: "64px",
					fontWeight: 700,
					color: "#ffffff",
					lineHeight: 1.1,
					marginBottom: "24px",
					maxWidth: "900px",
				}}
			>
				{title}
			</div>

			<div
				style={{
					fontSize: "28px",
					fontWeight: 400,
					color: "#ffffff",
					opacity: 0.6,
					maxWidth: "800px",
					lineHeight: 1.4,
				}}
			>
				{description}
			</div>
		</div>
	);
}
