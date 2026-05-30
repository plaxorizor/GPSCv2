// admin/DashboardSidebar.tsx
import React from "react";
import { LogOut } from "lucide-react";
import type { User } from "../types";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | null;
}

interface Props {
    user: User;
    rankName: string;
    currentSection: string;
    onSectionChange: (section: string) => void;
    items: SidebarItem[];
    onLogout: () => void;
}

const LogoLockup = () => (
    <div className="flex items-center gap-3">
        <div className="relative h-8 w-8">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="48" stroke="#14365C" strokeWidth="1.5" fill="none" opacity="0.4" />
                <path d="M 20 70 Q 30 55, 45 60 T 80 55" stroke="#4A8A2C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 25 75 Q 40 65, 55 70 T 82 65" stroke="#14365C" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <path d="M 50 25 L 50 38 M 44 31 L 56 31" stroke="#14365C" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="68" cy="42" r="6" fill="#4A8A2C" opacity="0.85" />
                <circle cx="72" cy="38" r="3" fill="#4A8A2C" />
                <path d="M 30 55 Q 35 48, 32 42 Q 30 38, 33 35" stroke="#14365C" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
        </div>
        <div className="leading-tight">
            <div className="font-display text-gpsc-navy text-base font-semibold tracking-tight">Green Pasture</div>
            <div className="font-display text-gpsc-green text-xs italic">Shepherd's Care</div>
        </div>
    </div>
);

export const DashboardSidebar: React.FC<Props> = ({ user, rankName, currentSection, onSectionChange, items, onLogout }) => (
    <aside className="border-gpsc-cream-dark hidden min-h-screen w-64 flex-col border-r bg-white lg:flex">
        <div className="border-gpsc-cream-dark border-b p-6">
            <LogoLockup />
        </div>
        <div className="border-gpsc-cream-dark border-b p-4">
            <div className="flex items-center gap-3">
                <div className="bg-gpsc-navy font-display flex h-10 w-10 items-center justify-center rounded-full text-sm text-white">
                    {user.initials}
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
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <span className="bg-gpsc-green ml-auto rounded-full px-2 py-0.5 text-xs text-white">{item.badge}</span>
                    )}
                </button>
            ))}
        </nav>
        <button
            onClick={onLogout}
            className="text-gpsc-stone hover:bg-gpsc-cream/60 m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
        >
            <LogOut size={16} /> Sign out
        </button>
    </aside>
);
