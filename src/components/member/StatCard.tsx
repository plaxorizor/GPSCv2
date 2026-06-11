import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, actionLabel, onAction, valueColor }) => (
    <div className="border-fsc-cream-dark rounded-2xl border bg-white p-5">
        <div className="mb-3 flex items-start justify-between">
            <div className="text-fsc-stone text-xs tracking-wider uppercase">{label}</div>
            <div className="bg-fsc-cream text-fsc-navy flex h-9 w-9 items-center justify-center rounded-full">
                <Icon size={16} />
            </div>
        </div>
        <div className="font-display text-3xl" style={{ color: valueColor ?? "#14365C" }}>
            {value}
        </div>
        {sub && <div className="text-fsc-stone mt-1 text-xs">{sub}</div>}
        {actionLabel && onAction && (
            <button onClick={onAction} className="text-fsc-green mt-3 text-xs hover:underline">
                {actionLabel} →
            </button>
        )}
    </div>
);
