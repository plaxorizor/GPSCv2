import React from "react";
import { LayoutGrid, Users, FileText, DollarSign, LogOut } from "lucide-react";

const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "members", label: "Members", icon: Users },
    { id: "claims", label: "Claims", icon: FileText },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "logout", label: "Sign out", icon: LogOut },
];

interface Props {
    current: string;
    onChange: (id: string) => void;
    claimsBadge?: number;
    commissionsBadge?: number;
    onLogout: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ current, onChange, claimsBadge, commissionsBadge, onLogout }) => (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gpsc-cream-dark z-50 flex">
        {tabs.map(({ id, label, icon: Icon }) => {
            const badge = id === "claims" ? claimsBadge : id === "commissions" ? commissionsBadge : undefined;
            const isLogout = id === "logout";
            return (
                <button
                    key={id}
                    onClick={() => isLogout ? onLogout() : onChange(id)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative text-xs transition-colors ${
                        isLogout
                            ? "text-red-500"
                            : current === id
                            ? "text-gpsc-navy"
                            : "text-gpsc-stone"
                    }`}
                >
                    {!isLogout && current === id && (
                        <span className="absolute top-0 inset-x-3 h-0.5 bg-gpsc-navy rounded-full" />
                    )}
                    <div className="relative">
                        <Icon size={20} />
                        {badge !== undefined && badge > 0 && (
                            <span className="absolute -top-1 -right-2 bg-gpsc-green text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                {badge}
                            </span>
                        )}
                    </div>
                    <span>{label}</span>
                </button>
            );
        })}
    </nav>
);