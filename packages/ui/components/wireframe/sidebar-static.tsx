import { WireframeSidebar } from "../wireframe";

export function SidebarStatic() {
	return (
		<WireframeSidebar collapsed={false} position="left">
			<div className="bg-(image:--crossed-gradient) flex min-h-full w-full items-center justify-between bg-lime-500/40">
				Sidebar
			</div>
		</WireframeSidebar>
	);
}
