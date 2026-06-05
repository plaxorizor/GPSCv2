import React, { useState } from "react";
import { Power } from "lucide-react";
import type { Member } from "../../utils/types";
import logo from "../../components/ui/Logo.png";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

interface Props {
    member: Member;
    rankName: string;
    currentSection: string;
    onSectionChange: (section: string) => void;
    items: SidebarItem[];
    onLogout: () => void;
}

export const DashboardSidebar: React.FC<Props> = ({ member, rankName, currentSection, onSectionChange, items, onLogout }) => {
    const [expanded, setExpanded] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <aside
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => {
                setExpanded(false);
                setHoveredId(null);
            }}
            style={{ width: expanded ? "16rem" : "4rem", transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
            className="border-gpsc-cream-dark fixed top-0 left-0 z-30 hidden h-screen flex-col overflow-hidden border-r bg-white lg:flex"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 overflow-hidden px-3 py-3">
                <img src={logo} alt="GPSC Logo" className="h-10 w-10 shrink-0 rounded-full object-contain" />
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

            {/* Member info */}
            <div className="border-gpsc-cream-dark overflow-hidden border-b px-3 py-3">
                <div className="flex items-center gap-3">
                    <div className="bg-gpsc-navy font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-white">
                        {member.firstName.charAt(0).toUpperCase() + member.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div
                        style={{
                            opacity: expanded ? 1 : 0,
                            transform: expanded ? "translateX(0)" : "translateX(-8px)",
                            transition: "opacity 300ms ease, transform 300ms ease",
                            transitionDelay: expanded ? "100ms" : "0ms",
                            minWidth: 0,
                            overflow: "hidden",
                        }}
                        className="flex-1 whitespace-nowrap"
                    >
                        <div className="font-display text-gpsc-navy truncate text-sm">
                            {member.firstName} {member.lastName}
                        </div>
                        <div className="text-gpsc-stone truncate text-xs">{rankName}</div>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 [scrollbar-width:none] space-y-1 overflow-y-auto p-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {items.filter(item => item.id !== "profile").map((item, i) => (
                    <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={() => !expanded && setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
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
                            {item.badge !== undefined && item.badge > 0 && (
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

                        {/* Tooltip — only rendered when collapsed AND hovered */}
                        {!expanded && hoveredId === item.id && (
                            <div
                                style={{ pointerEvents: "none" }}
                                className="absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center"
                            >
                                <div className="bg-gpsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">
                                    {item.label}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="bg-gpsc-green ml-1.5 rounded-full px-1.5 py-0.5 text-xs">{item.badge}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Profile — pinned above logout */}
            {items.find(item => item.id === "profile") && (() => {
                const item = items.find(item => item.id === "profile")!;
                return (
                    <div
                        className="relative"
                        onMouseEnter={() => !expanded && setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <button
                            onClick={() => onSectionChange(item.id)}
                            className={`m-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                                currentSection === item.id ? "bg-gpsc-cream text-gpsc-navy font-medium" : "text-gpsc-stone hover:bg-gpsc-cream/60"
                            }`}
                        >
                            <item.icon size={16} className="shrink-0" />
                            <span
                                style={{
                                    opacity: expanded ? 1 : 0,
                                    transform: expanded ? "translateX(0)" : "translateX(-6px)",
                                    transition: "opacity 250ms ease, transform 250ms ease",
                                    transitionDelay: expanded ? "140ms" : "0ms",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    flex: 1,
                                }}
                            >
                                {item.label}
                            </span>
                        </button>
                        {!expanded && hoveredId === item.id && (
                            <div style={{ pointerEvents: "none" }} className="absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center">
                                <div className="bg-gpsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">{item.label}</div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Logout */}
            <div className="relative" onMouseEnter={() => !expanded && setHoveredId("__logout__")} onMouseLeave={() => setHoveredId(null)}>
                <button
                    onClick={onLogout}
                    className="text-gpsc-stone hover:bg-gpsc-cream/60 m-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                >
                    <Power size={16} className="shrink-0" />
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
                        Log out
                    </span>
                </button>
                {!expanded && hoveredId === "__logout__" && (
                    <div style={{ pointerEvents: "none" }} className="absolute top-1/2 left-full z-50 ml-2 flex -translate-y-1/2 items-center">
                        <div className="bg-gpsc-navy rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sm">Log out</div>
                    </div>
                )}
            </div>
        </aside>
    );
};