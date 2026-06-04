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

    return (
        <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            style={{ width: expanded ? "16rem" : "4rem", transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
            className="border-gpsc-cream-dark fixed top-0 left-0 z-40 hidden h-screen flex-col overflow-hidden border-r bg-white lg:flex"
        >
            {/* Logo */}
            <div className="border-gpsc-cream-dark flex items-center gap-3 overflow-hidden border-b px-3 py-4">
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
                    <div className="font-display text-gpsc-navy text-base font-semibold tracking-tight">Green Pasture</div>
                    <div className="font-display text-gpsc-green text-xs italic">Shepherd's Care</div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                {items.map((item, i) => (
                    <div key={item.id} className="group relative">
                        <button
                            onClick={() => onSectionChange(item.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                currentSection === item.id ? "bg-gpsc-cream text-gpsc-navy font-medium" : "text-gpsc-stone hover:bg-gpsc-cream/60"
                            }`}
                        >
                            <item.icon size={16} className="shrink-0" />
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
                                    className="bg-gpsc-green shrink-0 rounded-full px-2 py-0.5 text-xs text-white"
                                >
                                    {item.badge}
                                </span>
                            )}
                        </button>

                        {/* Tooltip when collapsed */}
                        <div
                            style={{ pointerEvents: "none" }}
                            className="absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 items-center group-hover:flex"
                        >
                            {!expanded && (
                                <div className="bg-gpsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">
                                    {item.label}
                                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                                        <span className="bg-gpsc-green ml-1.5 rounded-full px-1.5 py-0.5 text-xs">{item.badge}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="group relative">
                <button
                    onClick={onLogout}
                    className="text-gpsc-stone hover:bg-gpsc-cream/60 m-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
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
                <div
                    style={{ pointerEvents: "none" }}
                    className="absolute top-1/2 left-full z-50 ml-2 hidden -translate-y-1/2 items-center group-hover:flex"
                >
                    {!expanded && <div className="bg-gpsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">Logout</div>}
                </div>
            </div>
        </aside>
    );
};
