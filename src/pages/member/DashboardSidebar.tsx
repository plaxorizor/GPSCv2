import React from "react";
import { LogOut } from "lucide-react";
import type { Member } from "../../utils/types";
import logo from "../../components/ui/Logo.png";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

interface Props {
    user: Member;
    rankName: string;
    currentSection: string;
    onSectionChange: (section: string) => void;
    items: SidebarItem[];
    onLogout: () => void;
}

export const DashboardSidebar: React.FC<Props> = ({ user, rankName, currentSection, onSectionChange, items, onLogout }) => (
    <aside className="border-gpsc-cream-dark fixed top-0 left-0 z-30 hidden h-screen w-64 flex-col overflow-y-auto border-r bg-white lg:flex">
        <div className="flex items-center gap-3">
            <img src={logo} alt="GPSC Logo" className="ml-2 h-14 w-14 rounded-full object-contain" />
            <div className="leading-tight">
                <div className="font-display text-gpsc-navy text-base font-semibold tracking-tight">Green Pasture</div>
                <div className="font-display text-gpsc-green text-xs italic">Shepherd's Care</div>
            </div>
        </div>
        <div className="border-gpsc-cream-dark border-b p-4">
            <div className="flex items-center gap-3">
                <div className="bg-gpsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-sm text-white">
                    {user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-display text-gpsc-navy truncate text-sm">
                        {user.firstName} {user.lastName}
                    </div>
                    <div className="text-gpsc-stone truncate text-xs">{rankName}</div>
                </div>
            </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        currentSection === item.id ? "bg-gpsc-cream text-gpsc-navy font-medium" : "text-gpsc-stone hover:bg-gpsc-cream/60"
                    }`}
                >
                    <item.icon size={16} />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-gpsc-green ml-auto rounded-full px-2 py-0.5 text-xs text-white">{item.badge}</span>
                    )}
                </button>
            ))}
        </nav>
        <button onClick={onLogout} className="text-gpsc-stone hover:bg-gpsc-cream/60 m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm">
            <LogOut size={16} /> Log out
        </button>
    </aside>
);
