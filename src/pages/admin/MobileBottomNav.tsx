import React from "react";
import { LayoutGrid, Users, FileText, DollarSign, Wallet, ArrowUpCircle, Settings as SettingsIcon, LogOut } from "lucide-react";

const tabs = [
    { id: "overview",    label: "Overview",     icon: LayoutGrid },
    { id: "members",     label: "Members",      icon: Users },
    { id: "claims",      label: "Claims",       icon: FileText },
    { id: "commissions", label: "Commissions",  icon: DollarSign },
    { id: "payouts",     label: "Payouts",      icon: Wallet },
    { id: "upgrades",    label: "Upgrades",     icon: ArrowUpCircle },
    { id: "settings",    label: "Settings",     icon: SettingsIcon },
    { id: "logout",      label: "Logout",       icon: LogOut },
];

interface Props {
    current: string;
    onChange: (id: string) => void;
    claimsBadge?: number;
    commissionsBadge?: number;
    payoutsBadge?: number;
    onLogout: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ current, onChange, claimsBadge, commissionsBadge, payoutsBadge, onLogout }) => (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-fsc-cream-dark z-50 flex pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ id, label, icon: Icon }) => {
            const badge = id === "claims" ? claimsBadge : id === "commissions" ? commissionsBadge : id === "payouts" ? payoutsBadge : undefined;
            const isLogout = id === "logout";
            return (
                <button
                    key={id}
                    onClick={() => isLogout ? onLogout() : onChange(id)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative text-xs transition-colors ${
                        isLogout
                            ? "text-[#C41E1E]"
                            : current === id
                            ? "text-fsc-navy"
                            : "text-fsc-stone"
                    }`}
                >
                    {!isLogout && current === id && (
                        <span className="absolute top-0 inset-x-3 h-0.5 bg-fsc-navy rounded-full" />
                    )}
                    <div className="relative">
                        <Icon size={20} />
                        {badge !== undefined && badge > 0 && (
                            <span className="absolute -top-1 -right-2 bg-fsc-green text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
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