import React from "react";
import { LayoutGrid, Wallet, FileText, Settings, Network } from "lucide-react";

const tabs = [
    { id: "overview", label: "Home", icon: LayoutGrid },
    { id: "referrals", label: "Referrals", icon: Network },
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
    <nav className="border-fsc-cream-dark fixed inset-x-0 bottom-0 z-50 flex border-t bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabs.map(({ id, label, icon: Icon }) => {
            const badge = id === "claims" ? claimsBadge : id === "referrals" ? referralsBadge : undefined;
            return (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                        current === id ? "text-fsc-navy" : "text-fsc-stone"
                    }`}
                >
                    {current === id && <span className="bg-fsc-navy absolute inset-x-3 top-0 h-0.5 rounded-full" />}
                    <div className="relative">
                        <Icon size={20} style={{ color: current === id ? "#C9922A" : undefined }} />
                        {badge !== undefined && badge > 0 && (
                            <span className="bg-fsc-green absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] leading-none text-white">
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
