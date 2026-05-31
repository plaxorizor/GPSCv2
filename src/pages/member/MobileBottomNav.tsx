import React from "react";
import { LayoutGrid, Wallet, FileText, Settings, Network } from "lucide-react";

const tabs = [
    { id: "overview", label: "Home", icon: LayoutGrid },
    { id: "referrals", label: "Network", icon: Network },
    { id: "earnings", label: "Earnings", icon: Wallet },
    { id: "claims", label: "Claims", icon: FileText },
    { id: "profile", label: "Profile", icon: Settings },
];

interface Props {
    current: string;
    onChange: (id: string) => void;
    claimsBadge?: number;
    referralsBadge?: number;
}

export const MobileBottomNav: React.FC<Props> = ({ current, onChange, claimsBadge, referralsBadge }) => (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gpsc-cream-dark z-50 flex">
        {tabs.map(({ id, label, icon: Icon }) => {
            const badge = id === "claims" ? claimsBadge : id === "referrals" ? referralsBadge : undefined;
            return (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative text-xs transition-colors ${
                        current === id ? "text-gpsc-navy" : "text-gpsc-stone"
                    }`}
                >
                    {current === id && (
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