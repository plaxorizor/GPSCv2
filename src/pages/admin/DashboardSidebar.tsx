// admin/DashboardSidebar.tsx
import React, { useState } from "react";
import { LogOut } from "lucide-react";
import logoSrc from "../../components/ui/Logo.png";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | null;
}

interface Props {
    currentSection: string;
    onSectionChange: (section: string) => void;
    items: SidebarItem[];
    onLogout: () => void;
}

export const DashboardSidebar: React.FC<Props> = ({ currentSection, onSectionChange, items, onLogout }) => {
    const [expanded, setExpanded] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Split settings out so it can be pinned above Logout
    const navItems = items.filter((item) => item.id !== "settings");
    const settingsItem = items.find((item) => item.id === "settings");

    const renderNavButton = (item: SidebarItem, i: number) => (
        <div key={item.id} className="relative" onMouseEnter={() => !expanded && setHoveredId(item.id)} onMouseLeave={() => setHoveredId(null)}>
            <button
                onClick={() => onSectionChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    currentSection === item.id ? "bg-fsc-cream text-fsc-navy font-medium" : "text-fsc-stone hover:bg-fsc-cream/60"
                }`}
            >
                <div className="relative shrink-0">
                    <item.icon size={16} />
                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span
                            style={{
                                opacity: expanded ? 0 : 1,
                                transition: "opacity 200ms ease",
                            }}
                            className="bg-fsc-green absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        >
                            {item.badge > 9 ? "9+" : item.badge}
                        </span>
                    )}
                </div>
                <span
                    style={{
                        opacity: expanded ? 1 : 0,
                        transform: expanded ? "translateX(0)" : "translateX(-6px)",
                        transition: "opacity 250ms ease, transform 250ms ease",
                        transitionDelay: expanded ? `${120 + i * 20}ms` : "0ms",
                        flex: 1,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.label}
                </span>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                    <span
                        style={{
                            opacity: expanded ? 1 : 0,
                            transition: "opacity 200ms ease",
                            transitionDelay: expanded ? `${160 + i * 20}ms` : "0ms",
                        }}
                        className="bg-fsc-green shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
                    >
                        {item.badge}
                    </span>
                )}
            </button>

            {/* Tooltip — only mounts when collapsed AND this item is hovered */}
            {!expanded && hoveredId === item.id && (
                <div style={{ pointerEvents: "none" }} className="absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center">
                    <div className="bg-fsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">
                        {item.label}
                        {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                            <span className="bg-fsc-green ml-1.5 rounded-full px-1.5 py-0.5 text-xs">{item.badge}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => {
                setExpanded(false);
                setHoveredId(null);
            }}
            style={{ width: expanded ? "16rem" : "4rem", transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
            className="border-fsc-cream-dark fixed top-0 left-0 z-40 hidden h-screen flex-col overflow-hidden border-r bg-white lg:flex"
        >
            {/* Logo */}
            <div className="border-fsc-cream-dark flex items-center gap-3 overflow-hidden border-b px-3 py-4">
                <img src={logoSrc} width={36} height={36} alt="Logo" className="shrink-0" />
                <div
                    style={{
                        opacity: expanded ? 1 : 0,
                        transform: expanded ? "translateX(0)" : "translateX(-8px)",
                        transition: "opacity 300ms ease, transform 300ms ease",
                        transitionDelay: expanded ? "80ms" : "0ms",
                        minWidth: 0,
                        overflow: "hidden",
                    }}
                    className="leading-tight whitespace-nowrap"
                >
                    <div className="font-display text-base font-semibold tracking-tight">
                        <span className="text-fsc-navy">FaithShield </span>
                        <span className="text-fsc-red">Care</span>
                    </div>
                    <div className="font-body text-fsc-stone text-[10px] italic">Admin Portal</div>
                </div>
            </div>

            {/* Nav items (excludes settings) */}
            <nav className="flex-1 scrollbar-none space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {navItems.map((item, i) => renderNavButton(item, i))}
            </nav>

            {/* Bottom section: Settings + Logout */}
            <div className="border-fsc-cream-dark space-y-1 border-t p-2">
                {/* Settings pinned above Logout */}
                {settingsItem && renderNavButton(settingsItem, navItems.length)}

                {/* Logout */}
                <div className="relative" onMouseEnter={() => !expanded && setHoveredId("__logout__")} onMouseLeave={() => setHoveredId(null)}>
                    <button
                        onClick={onLogout}
                        className="text-fsc-stone hover:bg-fsc-cream/60 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                    >
                        <LogOut size={16} className="shrink-0" />
                        <span
                            style={{
                                opacity: expanded ? 1 : 0,
                                transform: expanded ? "translateX(0)" : "translateX(-6px)",
                                transition: "opacity 250ms ease, transform 250ms ease",
                                transitionDelay: expanded ? "150ms" : "0ms",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                        >
                            Logout
                        </span>
                    </button>
                    {!expanded && hoveredId === "__logout__" && (
                        <div style={{ pointerEvents: "none" }} className="absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center">
                            <div className="bg-fsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
