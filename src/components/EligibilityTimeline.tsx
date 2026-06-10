import {
    Check,
    Stethoscope,
    Award,
    CloudRainWind,
    Baby,
    Cake,
    ShieldCheck,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import type { ClaimBenefit } from "../utils/eligibility";

export interface EligibilityBucket {
    label: string;
    months: number;
    unlocked: boolean;
    amount: number;
    documents: string[];
    variableAmount?: boolean;
}

// Benefit → icon + brand colour, matched by keyword in the benefit label.
const benefitVisual = (label: string): { Icon: LucideIcon; color: string } => {
    const l = label.toLowerCase();
    if (l.includes("hospital")) return { Icon: Stethoscope, color: "#2563EB" }; // blue
    if (l.includes("senior")) return { Icon: Award, color: "#C9922A" }; // gold
    if (l.includes("calamit")) return { Icon: CloudRainWind, color: "#EA580C" }; // orange
    if (l.includes("maternity")) return { Icon: Baby, color: "#DB2777" }; // pink
    if (l.includes("birthday")) return { Icon: Cake, color: "#7C3AED" }; // violet
    if (l.includes("death")) return { Icon: ShieldCheck, color: "#14365C" }; // navy
    return { Icon: Sparkles, color: "#475569" }; // slate fallback
};

// Whole days until a benefit unlocks, from the eligibility base date.
const daysUntil = (base: Date | null, months: number): number | null => {
    if (!base) return null;
    const unlock = new Date(base);
    unlock.setMonth(unlock.getMonth() + months);
    return Math.ceil((unlock.getTime() - Date.now()) / 86_400_000);
};

interface Props {
    timeline: EligibilityBucket[];
    /** Eligibility base date — countdowns run from here (resets on upgrade). */
    eligBase: Date | null;
    /** Fired when the member taps "Claim" on an unlocked benefit. */
    onClaim: (benefit: ClaimBenefit) => void;
    className?: string;
}

// Shared eligibility-timeline card. Lists each benefit, its unlock requirement,
// and a "Claim" button once unlocked. Used on both the Overview and Claims tabs.
export default function EligibilityTimeline({ timeline, eligBase, onClaim, className }: Props) {
    return (
        <div className={`border-fsc-cream-dark rounded-2xl border bg-white p-6 ${className ?? ""}`}>
            <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-fsc-navy text-lg">Eligibility Timeline</h2>
                <span className="bg-fsc-green/10 text-fsc-green rounded-full px-2.5 py-1 text-xs font-medium">
                    {timeline.filter((b) => b.unlocked).length}/{timeline.length} active
                </span>
            </div>
            <div className="relative space-y-1">
                {/* vertical rail behind the icons */}
                <div className="bg-fsc-cream-dark absolute top-4 bottom-4 left-[19px] w-px" />
                {timeline.map((item, i) => {
                    const { Icon, color } = benefitVisual(item.label);
                    const left = daysUntil(eligBase, item.months);
                    const countdown =
                        left == null
                            ? `${item.months}-month wait`
                            : left > 60
                              ? `~${Math.round(left / 30)} months left`
                              : `${Math.max(1, left)} day${Math.max(1, left) === 1 ? "" : "s"} left`;
                    return (
                        <div key={i} className="relative flex items-center gap-4 py-2">
                            {/* icon */}
                            <div
                                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ring-white"
                                style={{
                                    backgroundColor: `${color}1A`,
                                    opacity: item.unlocked ? 1 : 0.85,
                                }}
                            >
                                <Icon size={18} style={{ color }} />
                                {item.unlocked && (
                                    <span className="bg-fsc-green absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white">
                                        <Check size={10} strokeWidth={3} />
                                    </span>
                                )}
                            </div>
                            {/* text */}
                            <div className="min-w-0 flex-1">
                                <div className="text-fsc-navy text-sm font-medium">{item.label}</div>
                                <div className="text-fsc-stone text-xs">Requires {item.months}-month membership</div>
                            </div>
                            {/* status / action */}
                            {item.unlocked ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onClaim({
                                            label: item.label,
                                            amount: item.amount,
                                            documents: item.documents,
                                            variableAmount: item.variableAmount,
                                        })
                                    }
                                    className="bg-fsc-green shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
                                >
                                    Claim
                                </button>
                            ) : (
                                <span className="text-fsc-stone shrink-0 rounded-full bg-[#C9922A]/12 px-2.5 py-1 text-xs font-medium text-[#A87820]">
                                    {countdown}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
